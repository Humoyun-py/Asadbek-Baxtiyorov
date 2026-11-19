from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.models import Campaign
from apps.common.permissions import IsAdminOrAbove
from apps.contacts.models import ContactMessage
from apps.portfolio.models import PortfolioProfile
from apps.projects.models import Project
from apps.services.models import Service
from apps.statistics.models import Statistic

from .models import AnalyticsEvent as E
from .serializers import TrackSerializer
from .services import record_event


@extend_schema(request=TrackSerializer, responses={204: None})
class TrackView(APIView):
    """Public, rate-limited, write-only event ingestion."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = 'track'

    def post(self, request):
        ser = TrackSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        project = None
        if d['event_type'] == E.EventType.PROJECT_VIEW:
            project = Project.objects.filter(slug=d.get('project', ''), is_published=True).first()
            if not project:
                return Response({'project': 'Unknown project.'}, status=status.HTTP_400_BAD_REQUEST)
        record_event(d['event_type'], request, d.get('path', ''), project)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminOrAbove]


@extend_schema(responses=OpenApiTypes.OBJECT)
class OverviewView(AdminAnalyticsView):
    def get(self, request):
        pv = E.objects.filter(event_type=E.EventType.PAGE_VIEW)
        week = timezone.now() - timedelta(days=7)
        budget_stat = Statistic.objects.filter(key='advertising-budget').first()
        profile = PortfolioProfile.load()
        return Response({
            'projects_total': Project.objects.count(),
            'projects_published': Project.objects.filter(is_published=True).count(),
            'services_total': Service.objects.count(),
            'campaigns_total': Campaign.objects.count(),
            'messages_new': ContactMessage.objects.filter(status=ContactMessage.Status.NEW).count(),
            'visits_total': pv.count(),
            'visits_7d': pv.filter(created_at__gte=week).count(),
            'unique_visitor_days': pv.values('visitor_hash', date=TruncDate('created_at')).distinct().count(),
            'project_views_total': E.objects.filter(event_type=E.EventType.PROJECT_VIEW).count(),
            'contact_submissions_total': E.objects.filter(event_type=E.EventType.CONTACT_SUBMIT).count(),
            'advertising_budget': profile.advertising_budget,
            'advertising_budget_label': budget_stat.title if budget_stat else 'General advertising budget',
        })


@extend_schema(parameters=[OpenApiParameter('days', int, description='Days of daily data (1-365, default 30)')], responses=OpenApiTypes.OBJECT)
class VisitsView(AdminAnalyticsView):
    def get(self, request):
        try:
            days = max(1, min(int(request.query_params.get('days', 30)), 365))
        except ValueError:
            days = 30
        now = timezone.now()
        pv = E.objects.filter(event_type=E.EventType.PAGE_VIEW)
        since = timezone.localtime(now).date() - timedelta(days=days - 1)
        rows = (pv.filter(created_at__date__gte=since).annotate(d=TruncDate('created_at')).values('d')
                .annotate(visits=Count('id'), unique=Count('visitor_hash', distinct=True)))
        by_day = {r['d']: r for r in rows}
        daily = []
        for i in range(days):
            day = since + timedelta(days=i)
            r = by_day.get(day)
            daily.append({'date': day.isoformat(), 'visits': r['visits'] if r else 0,
                          'unique': r['unique'] if r else 0})
        mrows = (pv.annotate(m=TruncMonth('created_at')).values('m').annotate(visits=Count('id')).order_by('-m')[:12])
        monthly = [{'month': r['m'].strftime('%Y-%m'), 'visits': r['visits']} for r in reversed(list(mrows))]
        return Response({'daily': daily, 'monthly': monthly})


@extend_schema(responses=OpenApiTypes.OBJECT)
class PopularProjectsView(AdminAnalyticsView):
    def get(self, request):
        rows = (E.objects.filter(event_type=E.EventType.PROJECT_VIEW, project__isnull=False)
                .values('project__id', 'project__title', 'project__slug').annotate(views=Count('id'))
                .order_by('-views')[:10])
        return Response([{'id': r['project__id'], 'title': r['project__title'], 'slug': r['project__slug'],
                          'views': r['views']} for r in rows])


@extend_schema(responses=OpenApiTypes.OBJECT)
class ContactStatsView(AdminAnalyticsView):
    def get(self, request):
        by_status = {s: 0 for s, _ in ContactMessage.Status.choices}
        for r in ContactMessage.objects.values('status').annotate(c=Count('id')):
            by_status[r['status']] = r['c']
        since = timezone.localtime(timezone.now()).date() - timedelta(days=29)
        rows = (ContactMessage.objects.filter(created_at__date__gte=since).annotate(d=TruncDate('created_at'))
                .values('d').annotate(c=Count('id')))
        by_day = {r['d']: r['c'] for r in rows}
        daily = [{'date': (since + timedelta(days=i)).isoformat(), 'count': by_day.get(since + timedelta(days=i), 0)}
                 for i in range(30)]
        return Response({'by_status': by_status, 'total': sum(by_status.values()), 'daily': daily})
