from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('admin/users', views.UserViewSet, basename='user')

urlpatterns = [
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', views.RefreshView.as_view(), name='token-refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/password-reset/', views.PasswordResetRequestView.as_view(), name='password-reset'),
    path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('admin/activity-logs/', views.ActivityLogListView.as_view(), name='activity-logs'),
] + router.urls
