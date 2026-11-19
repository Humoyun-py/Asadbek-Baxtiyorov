from django.urls import path

from . import views

urlpatterns = [
    path('analytics/track/', views.TrackView.as_view(), name='analytics-track'),
    path('admin/analytics/overview/', views.OverviewView.as_view(), name='analytics-overview'),
    path('admin/analytics/visits/', views.VisitsView.as_view(), name='analytics-visits'),
    path('admin/analytics/projects/', views.PopularProjectsView.as_view(), name='analytics-projects'),
    path('admin/analytics/contacts/', views.ContactStatsView.as_view(), name='analytics-contacts'),
]
