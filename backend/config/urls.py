from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

admin.site.site_header = 'Asadbek Baxtiyorov — Portfolio Administration'
admin.site.site_title = 'Portfolio Admin'
admin.site.index_title = 'Content management'

v1 = [
    path('', include('apps.accounts.urls')),
    path('', include('apps.portfolio.urls')),
    path('', include('apps.projects.urls')),
    path('', include('apps.services.urls')),
    path('', include('apps.statistics.urls')),
    path('', include('apps.campaigns.urls')),
    path('', include('apps.contacts.urls')),
    path('', include('apps.testimonials.urls')),
    path('', include('apps.website_settings.urls')),
    path('', include('apps.analytics.urls')),
]

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/v1/', include(v1)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
