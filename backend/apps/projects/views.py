from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.common.mixins import ActivityLogMixin, PublicReadMixin, ReorderMixin
from apps.common.permissions import ADMIN, EDITOR, RoleBasedWrite

from .models import Project, ProjectCategory, ProjectImage
from .serializers import ProjectCategorySerializer, ProjectImageSerializer, ProjectSerializer


class ProjectCategoryViewSet(ActivityLogMixin, ReorderMixin, viewsets.ModelViewSet):
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [RoleBasedWrite]
    write_role = ADMIN
    pagination_class = None
    log_label = 'ProjectCategory'

    def perform_destroy(self, instance):
        if instance.projects.exists():
            raise ValidationError('This category still has projects. Move or delete them first.')
        super().perform_destroy(instance)


class ProjectViewSet(PublicReadMixin, ActivityLogMixin, ReorderMixin, viewsets.ModelViewSet):
    queryset = Project.objects.select_related('category').prefetch_related('gallery')
    serializer_class = ProjectSerializer
    permission_classes = [RoleBasedWrite]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    write_role = EDITOR
    delete_role = ADMIN
    action_roles = {'upload_images': EDITOR, 'delete_image': EDITOR, 'set_cover': EDITOR, 'reorder': EDITOR}
    filterset_fields = {'category': ['exact'], 'category__slug': ['exact'], 'is_featured': ['exact'],
                        'is_published': ['exact']}
    search_fields = ['title', 'short_description', 'client_name', 'role']
    ordering_fields = ['display_order', 'created_at', 'title', 'followers_count']
    log_label = 'Project'

    def get_object(self):
        """GET by slug (public site) or id (admin): /projects/<slug>/ and /projects/<id>/."""
        lookup = self.kwargs[self.lookup_field]
        qs = self.filter_queryset(self.get_queryset())
        obj = qs.filter(pk=int(lookup)).first() if lookup.isdigit() else qs.filter(slug=lookup).first()
        if obj is None:
            raise NotFound()
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=['post'], url_path='images', parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        project = self.get_object()
        files = request.FILES.getlist('images')
        if not files:
            raise ValidationError({'images': 'No files were uploaded.'})
        if len(files) > 20:
            raise ValidationError({'images': 'Upload at most 20 images at once.'})
        start = project.gallery.count()
        created = []
        with transaction.atomic():
            for i, f in enumerate(files):
                ser = ProjectImageSerializer(data={'image': f, 'display_order': start + i}, context={'request': request})
                ser.is_valid(raise_exception=True)
                created.append(ser.save(project=project))
        self._log('upload_images', project)
        return Response(ProjectImageSerializer(created, many=True, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path=r'images/(?P<image_id>\d+)')
    def delete_image(self, request, pk=None, image_id=None):
        project = self.get_object()
        img = project.gallery.filter(pk=image_id).first()
        if not img:
            raise NotFound()
        name = img.image.name
        in_use_as_cover = project.cover_image and project.cover_image.name == name
        img.delete()
        if name and not in_use_as_cover:
            img.image.storage.delete(name)
        self._log('delete_image', project)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='set-cover')
    def set_cover(self, request, pk=None):
        project = self.get_object()
        img = project.gallery.filter(pk=request.data.get('image_id')).first()
        if not img:
            raise ValidationError({'image_id': 'Gallery image not found for this project.'})
        project.cover_image.name = img.image.name
        project.save(update_fields=['cover_image', 'updated_at'])
        self._log('set_cover', project)
        return Response(ProjectSerializer(project, context={'request': request}).data)
