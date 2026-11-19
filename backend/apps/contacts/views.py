from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.services import log_activity
from apps.analytics.services import record_event
from apps.common.permissions import IsAdminOrAbove

from .models import ContactMessage
from .serializers import ContactAdminSerializer, ContactCreateSerializer
from .services import looks_like_spam


class ContactViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    """POST is public (rate limited). Everything else is ADMIN+ only; messages are never public."""
    queryset = ContactMessage.objects.all()
    filterset_fields = ['status']
    search_fields = ['full_name', 'email', 'phone', 'telegram_username', 'subject', 'message']
    ordering_fields = ['created_at', 'status']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        return [AllowAny()] if self.action == 'create' else [IsAdminOrAbove()]

    def get_throttles(self):
        if self.action == 'create':
            self.throttle_scope = 'contact'
            return super().get_throttles()
        return []

    def get_serializer_class(self):
        return ContactCreateSerializer if self.action == 'create' else ContactAdminSerializer

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = dict(ser.validated_data)
        if data.pop('website', ''):  # honeypot filled in => bot. Pretend success, store nothing.
            return Response({'detail': 'Message sent.'}, status=status.HTTP_201_CREATED)
        spam = looks_like_spam(data)
        msg = ContactMessage.objects.create(
            **data, status=ContactMessage.Status.SPAM if spam else ContactMessage.Status.NEW)
        if not spam:
            record_event('CONTACT_SUBMIT', request)
        return Response({'detail': 'Message sent.'}, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, 'update', 'ContactMessage', obj.pk, f'status={obj.status}')

    def perform_destroy(self, instance):
        log_activity(self.request.user, 'delete', 'ContactMessage', instance.pk, '')
        instance.delete()
