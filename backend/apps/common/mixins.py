from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from .permissions import ADMIN, is_staff_user


class PublicReadMixin:
    """Anonymous visitors only see published/active rows; staff see everything."""
    public_filter = {'is_published': True}

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.method == 'GET' and not is_staff_user(self.request.user):
            qs = qs.filter(**self.public_filter)
        return qs


class ActivityLogMixin:
    """Writes an ActivityLog row for create / update / delete."""
    log_label = None

    def _log(self, action_name, obj):
        from apps.accounts.services import log_activity
        log_activity(self.request.user, action_name, self.log_label or obj.__class__.__name__,
                     getattr(obj, 'pk', ''), str(obj)[:200])

    def perform_create(self, serializer):
        obj = serializer.save()
        self._log('create', obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        self._log('update', obj)

    def perform_destroy(self, instance):
        self._log('delete', instance)
        instance.delete()


class ReorderMixin:
    """POST /<resource>/reorder/  body: {"ids": [3,1,2]} -> display_order = position."""

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        ids = request.data.get('ids')
        if not isinstance(ids, list) or not all(isinstance(i, int) for i in ids):
            return Response({'detail': '"ids" must be a list of integers.'}, status=status.HTTP_400_BAD_REQUEST)
        model = self.get_queryset().model
        with transaction.atomic():
            for position, pk in enumerate(ids):
                model.objects.filter(pk=pk).update(display_order=position)
        from apps.accounts.services import log_activity
        log_activity(request.user, 'reorder', self.log_label or model.__name__, '', f'{len(ids)} items')
        return Response({'status': 'ok'})
