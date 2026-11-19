from django.contrib import admin

from .models import AnalyticsEvent


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'event_type', 'path', 'project')
    list_filter = ('event_type',)
    date_hierarchy = 'created_at'
    readonly_fields = [f.name for f in AnalyticsEvent._meta.fields]

    def has_add_permission(self, request):
        return False
