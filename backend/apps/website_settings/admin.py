from django.contrib import admin

from .models import WebsiteSettings


@admin.register(WebsiteSettings)
class WebsiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('website_title', 'maintenance_mode', 'updated_at')

    def has_add_permission(self, request):
        return not WebsiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
