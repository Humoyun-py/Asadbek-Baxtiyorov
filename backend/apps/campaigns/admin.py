from django.contrib import admin

from .models import Campaign, CampaignImage, CampaignStatistic


class CampaignStatisticInline(admin.TabularInline):
    model = CampaignStatistic
    extra = 1


class CampaignImageInline(admin.TabularInline):
    model = CampaignImage
    extra = 0


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'university_name', 'followers_count', 'leads', 'is_active', 'display_order')
    list_editable = ('is_active', 'display_order')
    list_filter = ('is_active',)
    search_fields = ('title', 'university_name')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CampaignStatisticInline, CampaignImageInline]
