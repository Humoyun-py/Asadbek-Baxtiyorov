import re

from rest_framework import serializers

from .models import WebsiteSettings

HEX = re.compile(r'^#[0-9a-fA-F]{6}$')


class WebsiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteSettings
        exclude = ['id']
        read_only_fields = ['updated_at']

    def _hex(self, v):
        if not HEX.match(v):
            raise serializers.ValidationError('Use a hex colour like #2f5bff.')
        return v

    validate_primary_color = _hex
    validate_secondary_color = _hex
