from django.contrib import admin

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon', 'is_active', 'display_order')
    list_editable = ('is_active', 'display_order')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title',)
