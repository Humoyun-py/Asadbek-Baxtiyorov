from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import Campaign, CampaignImage, CampaignStatistic


class CampaignStatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignStatistic
        fields = ['id', 'campaign', 'title', 'value', 'prefix', 'suffix', 'is_active', 'display_order']
        read_only_fields = ['id']


class CampaignImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignImage
        fields = ['id', 'image', 'caption', 'display_order']
        read_only_fields = ['id']


class CampaignSerializer(serializers.ModelSerializer):
    statistics = serializers.SerializerMethodField()
    gallery = CampaignImageSerializer(many=True, read_only=True)

    class Meta:
        model = Campaign
        fields = ['id', 'title', 'university_name', 'description', 'role', 'points', 'followers_count',
                  'advertising_budget', 'impressions', 'clicks', 'leads', 'cpc', 'cpm', 'cost_per_lead',
                  'campaign_image', 'start_date', 'end_date', 'is_active', 'display_order', 'statistics',
                  'gallery', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    @extend_schema_field(CampaignStatisticSerializer(many=True))
    def get_statistics(self, obj):
        request = self.context.get('request')
        from apps.common.permissions import is_staff_user
        qs = obj.statistics.all()
        if not (request and is_staff_user(request.user)):
            qs = qs.filter(is_active=True)
        return CampaignStatisticSerializer(qs, many=True).data

    def validate_points(self, value):
        if not isinstance(value, list) or not all(isinstance(x, str) for x in value):
            raise serializers.ValidationError('Must be a list of strings.')
        return value

    def validate(self, attrs):
        start, end = attrs.get('start_date'), attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'End date cannot be before start date.'})
        return attrs
