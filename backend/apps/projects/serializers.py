from rest_framework import serializers

from .models import Project, ProjectCategory, ProjectImage


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ['id', 'name', 'slug', 'display_order']
        extra_kwargs = {'slug': {'required': False}}


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'caption', 'display_order', 'created_at']
        read_only_fields = ['id', 'created_at']


def _validate_str_list(value):
    if not isinstance(value, list) or not all(isinstance(x, str) and len(x) <= 300 for x in value):
        raise serializers.ValidationError('Must be a list of strings.')
    return value


class ProjectSerializer(serializers.ModelSerializer):
    category_detail = ProjectCategorySerializer(source='category', read_only=True)
    gallery = ProjectImageSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'slug', 'category', 'category_detail', 'badge', 'short_description',
                  'full_description', 'client_name', 'role', 'followers_count', 'project_image', 'cover_image',
                  'gallery', 'project_url', 'instagram_url', 'telegram_url', 'handle', 'direction',
                  'highlights', 'extra_lists', 'start_date', 'end_date', 'is_featured', 'is_published',
                  'display_order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {'slug': {'required': False}}

    def validate_highlights(self, value):
        return _validate_str_list(value)

    def validate_extra_lists(self, value):
        ok = isinstance(value, list) and all(
            isinstance(x, dict) and isinstance(x.get('title'), str) and
            isinstance(x.get('items'), list) and all(isinstance(i, str) for i in x['items'])
            for x in value)
        if not ok:
            raise serializers.ValidationError('Must be a list of {"title": str, "items": [str]}.')
        return value

    def validate(self, attrs):
        start, end = attrs.get('start_date'), attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'End date cannot be before start date.'})
        return attrs
