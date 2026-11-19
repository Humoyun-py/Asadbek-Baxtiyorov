from rest_framework import serializers

from .models import PortfolioProfile


class PortfolioProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProfile
        exclude = ['id']
        read_only_fields = ['updated_at']
