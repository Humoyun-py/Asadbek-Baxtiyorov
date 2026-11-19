import re

from rest_framework import serializers

from .models import ContactMessage

TG_RE = re.compile(r'^@?[A-Za-z0-9_]{4,32}$')
PHONE_RE = re.compile(r'^\+?[\d\s()\-]{7,20}$')


class ContactCreateSerializer(serializers.ModelSerializer):
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)  # honeypot

    class Meta:
        model = ContactMessage
        fields = ['full_name', 'email', 'phone', 'telegram_username', 'subject', 'message', 'website']
        extra_kwargs = {
            'email': {'required': False}, 'phone': {'required': False}, 'telegram_username': {'required': False},
            'full_name': {'min_length': 2}, 'message': {'min_length': 5, 'max_length': 5000},
        }

    def validate_phone(self, v):
        if v and not PHONE_RE.match(v):
            raise serializers.ValidationError('Enter a valid phone number.')
        return v

    def validate_telegram_username(self, v):
        if v and not TG_RE.match(v):
            raise serializers.ValidationError('Enter a valid Telegram username.')
        return v

    def validate(self, attrs):
        if not (attrs.get('email') or attrs.get('phone') or attrs.get('telegram_username')):
            raise serializers.ValidationError('Provide at least one contact method: email, phone or Telegram.')
        return attrs


class ContactAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'full_name', 'email', 'phone', 'telegram_username', 'subject', 'message', 'status',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'full_name', 'email', 'phone', 'telegram_username', 'subject', 'message',
                            'created_at', 'updated_at']
