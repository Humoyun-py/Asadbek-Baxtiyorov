from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import ActivityLog, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'last_login')
    list_filter = ('role', 'is_active')
    fieldsets = UserAdmin.fieldsets + (('Role', {'fields': ('role',)}),)
    add_fieldsets = UserAdmin.add_fieldsets + ((None, {'fields': ('email', 'role')}),)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'username', 'action', 'object_type', 'object_id', 'object_repr')
    list_filter = ('action', 'object_type')
    search_fields = ('username', 'object_repr')
    date_hierarchy = 'created_at'
    readonly_fields = [f.name for f in ActivityLog._meta.fields]

    def has_add_permission(self, request):
        return False
