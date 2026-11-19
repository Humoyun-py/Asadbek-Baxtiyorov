from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.services import log_activity
from apps.campaigns.models import Campaign
from apps.campaigns.serializers import CampaignSerializer
from apps.common.permissions import ADMIN, RoleBasedWrite
from apps.projects.models import Project, ProjectCategory
from apps.projects.serializers import ProjectCategorySerializer, ProjectSerializer
from apps.services.models import Service
from apps.services.serializers import ServiceSerializer
from apps.statistics.models import Statistic
from apps.statistics.serializers import StatisticSerializer
from apps.testimonials.models import Testimonial
from apps.testimonials.serializers import TestimonialSerializer
from apps.website_settings.models import WebsiteSettings
from apps.website_settings.serializers import WebsiteSettingsSerializer

from .models import PortfolioProfile
from .serializers import PortfolioProfileSerializer


class PortfolioProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PortfolioProfileSerializer
    permission_classes = [RoleBasedWrite]
    write_role = ADMIN
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return PortfolioProfile.load()

    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, 'update', 'PortfolioProfile', obj.pk, obj.full_name)


@extend_schema(responses=OpenApiTypes.OBJECT)
class PortfolioView(APIView):
    """Everything the public website needs in one request (published/active content only)."""
    permission_classes = [AllowAny]

    def get(self, request):
        ctx = {'request': request}
        projects = Project.objects.filter(is_published=True).select_related('category').prefetch_related('gallery')
        return Response({
            'profile': PortfolioProfileSerializer(PortfolioProfile.load(), context=ctx).data,
            'settings': WebsiteSettingsSerializer(WebsiteSettings.load(), context=ctx).data,
            'categories': ProjectCategorySerializer(ProjectCategory.objects.all(), many=True).data,
            'projects': ProjectSerializer(projects, many=True, context=ctx).data,
            'services': ServiceSerializer(Service.objects.filter(is_active=True), many=True).data,
            'statistics': StatisticSerializer(Statistic.objects.filter(is_active=True), many=True).data,
            'campaigns': CampaignSerializer(Campaign.objects.filter(is_active=True), many=True, context=ctx).data,
            'testimonials': TestimonialSerializer(Testimonial.objects.filter(is_published=True), many=True,
                                                  context=ctx).data,
        })
