from rest_framework import serializers

from .models import AnalyticsEvent


class TrackSerializer(serializers.Serializer):
    event_type = serializers.ChoiceField(choices=[AnalyticsEvent.EventType.PAGE_VIEW,
                                                  AnalyticsEvent.EventType.PROJECT_VIEW])
    path = serializers.CharField(max_length=200, required=False, allow_blank=True)
    project = serializers.CharField(max_length=200, required=False, allow_blank=True,
                                    help_text='Project slug (for PROJECT_VIEW)')
