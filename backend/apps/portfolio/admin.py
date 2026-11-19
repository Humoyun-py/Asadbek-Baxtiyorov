from django.contrib import admin

from .models import PortfolioProfile


@admin.register(PortfolioProfile)
class PortfolioProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'professional_title', 'agency_name', 'updated_at')

    def has_add_permission(self, request):
        return not PortfolioProfile.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
