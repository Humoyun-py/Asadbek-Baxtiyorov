from django.contrib import admin

from .models import Testimonial


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'company_name', 'rating', 'is_published', 'display_order')
    list_editable = ('is_published', 'display_order')
    list_filter = ('is_published', 'rating')
    search_fields = ('client_name', 'company_name')
    date_hierarchy = 'created_at'
