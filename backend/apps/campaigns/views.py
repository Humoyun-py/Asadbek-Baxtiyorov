from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.common.mixins import ActivityLogMixin, PublicReadMixin, ReorderMixin
from apps.common.permissions import ADMIN, RoleBasedWrite

from .models import Campaign, CampaignStatistic
from .serializers import CampaignImageSerializer, CampaignSerializer, CampaignStatisticSerializer


class CampaignViewSet(PublicReadMixin, ActivityLogMixin, ReorderMixin, viewsets.ModelViewSet):
    queryset = Campaign.objects.prefetch_related('statistics', 'gallery')
    serializer_class = CampaignSerializer
    permission_classes = [RoleBasedWrite]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    public_filter = {'is_active': True}
    write_role = ADMIN
    filterset_fields = ['is_active']
    search_fields = ['title', 'university_name', 'description']
    log_label = 'Campaign'

    @action(detail=True, methods=['post'], url_path='images', parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        campaign = self.get_object()
        files = request.FILES.getlist('images')
        if not files:
            raise ValidationError({'images': 'No files were uploaded.'})
        start = campaign.gallery.count()
        created = []
        with transaction.atomic():
            for i, f in enumerate(files[:20]):
                ser = CampaignImageSerializer(data={'image': f, 'display_order': start + i},
                                              context={'request': request})
                ser.is_valid(raise_exception=True)
                created.append(ser.save(campaign=campaign))
        self._log('upload_images', campaign)
        return Response(CampaignImageSerializer(created, many=True, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path=r'images/(?P<image_id>\d+)')
    def delete_image(self, request, pk=None, image_id=None):
        campaign = self.get_object()
        img = campaign.gallery.filter(pk=image_id).first()
        if not img:
            raise NotFound()
        name = img.image.name
        img.delete()
        img.image.storage.delete(name)
        self._log('delete_image', campaign)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CampaignStatisticViewSet(ActivityLogMixin, ReorderMixin, viewsets.ModelViewSet):
    queryset = CampaignStatistic.objects.select_related('campaign')
    serializer_class = CampaignStatisticSerializer
    permission_classes = [RoleBasedWrite]
    write_role = ADMIN
    pagination_class = None
    filterset_fields = ['campaign', 'is_active']
    log_label = 'CampaignStatistic'

    def get_queryset(self):
        from apps.common.permissions import is_staff_user
        qs = super().get_queryset()
        if self.request.method == 'GET' and not is_staff_user(self.request.user):
            qs = qs.filter(is_active=True, campaign__is_active=True)
        return qs
