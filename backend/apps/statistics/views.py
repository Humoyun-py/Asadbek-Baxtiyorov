from rest_framework import viewsets

from apps.common.mixins import ActivityLogMixin, PublicReadMixin, ReorderMixin
from apps.common.permissions import ADMIN, RoleBasedWrite

from .models import Statistic
from .serializers import StatisticSerializer


class StatisticViewSet(PublicReadMixin, ActivityLogMixin, ReorderMixin, viewsets.ModelViewSet):
    queryset = Statistic.objects.all()
    serializer_class = StatisticSerializer
    permission_classes = [RoleBasedWrite]
    public_filter = {'is_active': True}
    write_role = ADMIN
    pagination_class = None
    filterset_fields = ['category', 'is_active']
    search_fields = ['title', 'key']
    log_label = 'Statistic'
