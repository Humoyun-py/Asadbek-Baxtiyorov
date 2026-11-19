from django.contrib import admin

from .models import Project, ProjectCategory, ProjectImage


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_featured', 'is_published', 'display_order', 'updated_at')
    list_filter = ('category', 'is_published', 'is_featured')
    list_editable = ('is_published', 'is_featured', 'display_order')
    search_fields = ('title', 'client_name', 'short_description')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    inlines = [ProjectImageInline]
