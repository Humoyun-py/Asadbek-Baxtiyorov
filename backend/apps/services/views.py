from rest_framework import viewsets

from apps.common.mixins import ActivityLogMixin, PublicReadMixin, ReorderMixin
from apps.common.permissions import ADMIN, RoleBasedWrite

from .models import Service
from .serializers import ServiceSerializer


class ServiceViewSet(PublicReadMixin, ActivityLogMixin, ReorderMixin, viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [RoleBasedWrite]
    public_filter = {'is_active': True}
    write_role = ADMIN
    pagination_class = None
    search_fields = ['title', 'description']
    log_label = 'Service'
