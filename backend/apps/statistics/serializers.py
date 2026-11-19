from rest_framework import serializers

from .models import Statistic


class StatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistic
        fields = ['id', 'key', 'title', 'value', 'prefix', 'suffix', 'description', 'category', 'is_active',
                  'display_order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
