from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'subject', 'email', 'telegram_username', 'status', 'created_at')
    list_filter = ('status',)
    list_editable = ('status',)
    search_fields = ('full_name', 'email', 'subject', 'message')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
