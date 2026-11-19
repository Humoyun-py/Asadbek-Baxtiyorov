from django.contrib import admin

from .models import Statistic


@admin.register(Statistic)
class StatisticAdmin(admin.ModelAdmin):
    list_display = ('title', 'key', 'category', 'prefix', 'value', 'suffix', 'is_active', 'display_order')
    list_filter = ('category', 'is_active')
    list_editable = ('is_active', 'display_order')
    search_fields = ('title', 'key')
