from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from apps.common.mixins import ActivityLogMixin, PublicReadMixin, ReorderMixin
from apps.common.permissions import ADMIN, RoleBasedWrite

from .models import Testimonial
from .serializers import TestimonialSerializer


class TestimonialViewSet(PublicReadMixin, ActivityLogMixin, ReorderMixin, viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [RoleBasedWrite]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    write_role = ADMIN
    pagination_class = None
    search_fields = ['client_name', 'company_name', 'testimonial_text']
    log_label = 'Testimonial'
