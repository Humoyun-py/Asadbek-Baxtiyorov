from rest_framework import generics
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from apps.accounts.services import log_activity
from apps.common.permissions import SUPERADMIN, RoleBasedWrite

from .models import WebsiteSettings
from .serializers import WebsiteSettingsSerializer


class WebsiteSettingsView(generics.RetrieveUpdateAPIView):
    """GET is public (site branding/SEO). PATCH is SUPERADMIN only."""
    serializer_class = WebsiteSettingsSerializer
    permission_classes = [RoleBasedWrite]
    write_role = SUPERADMIN
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return WebsiteSettings.load()

    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, 'update', 'WebsiteSettings', obj.pk, 'settings')
