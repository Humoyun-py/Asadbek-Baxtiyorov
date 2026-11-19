from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.common.permissions import IsAdminOrAbove, IsSuperAdmin

from .models import ActivityLog, User
from .serializers import (ActivityLogSerializer, ChangePasswordSerializer, LoginSerializer,
                          PasswordResetConfirmSerializer, PasswordResetRequestSerializer,
                          ProfileUpdateSerializer, UserSerializer, UserWriteSerializer, make_reset_uid_token)
from .services import log_activity


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    throttle_scope = 'login'
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.filter(username=request.data.get('username')).first()
            if user:
                log_activity(user, 'login', 'User', user.pk, user.username)
        return response


class RefreshView(TokenRefreshView):
    throttle_scope = 'login'
    permission_classes = [AllowAny]


@extend_schema(request=inline_serializer('LogoutRequest', {'refresh': drf_serializers.CharField()}), responses={204: None})
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            RefreshToken(request.data.get('refresh', '')).blacklist()
        except TokenError:
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)
        log_activity(request.user, 'logout', 'User', request.user.pk, request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(request=ProfileUpdateSerializer, responses=UserSerializer)
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        ser = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(UserSerializer(request.user).data)


@extend_schema(request=ChangePasswordSerializer, responses=OpenApiResponse(description='Password changed.'))
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ChangePasswordSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)
        request.user.set_password(ser.validated_data['new_password'])
        request.user.save()
        log_activity(request.user, 'password_change', 'User', request.user.pk, request.user.username)
        return Response({'detail': 'Password changed.'})


@extend_schema(request=PasswordResetRequestSerializer, responses=OpenApiResponse(description='Always 200 (does not reveal if the email exists).'))
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'password_reset'

    def post(self, request):
        ser = PasswordResetRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=ser.validated_data['email'], is_active=True).first()
        if user:
            uid, token = make_reset_uid_token(user)
            link = f'{settings.ADMIN_PANEL_URL}/reset-password?uid={uid}&token={token}'
            send_mail('Password reset', f'Open this link to reset your password:\n{link}',
                      settings.DEFAULT_FROM_EMAIL, [user.email])
        # Same response either way: do not reveal which emails exist
        return Response({'detail': 'If the email exists, a reset link has been sent.'})


@extend_schema(request=PasswordResetConfirmSerializer, responses=OpenApiResponse(description='Password reset.'))
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'password_reset'

    def post(self, request):
        ser = PasswordResetConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.validated_data['user']
        user.set_password(ser.validated_data['new_password'])
        user.save()
        log_activity(user, 'password_reset', 'User', user.pk, user.username)
        return Response({'detail': 'Password has been reset.'})


class UserViewSet(viewsets.ModelViewSet):
    """SUPERADMIN only: manage administrators."""
    queryset = User.objects.all().order_by('id')
    permission_classes = [IsSuperAdmin]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    filterset_fields = ['role', 'is_active']

    def get_serializer_class(self):
        return UserSerializer if self.request.method == 'GET' else UserWriteSerializer

    def perform_create(self, serializer):
        u = serializer.save()
        log_activity(self.request.user, 'create', 'User', u.pk, u.username)

    def perform_update(self, serializer):
        u = serializer.save()
        log_activity(self.request.user, 'update', 'User', u.pk, u.username)

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You cannot delete your own account.')
        log_activity(self.request.user, 'delete', 'User', instance.pk, instance.username)
        instance.delete()


class ActivityLogListView(generics.ListAPIView):
    permission_classes = [IsAdminOrAbove]
    serializer_class = ActivityLogSerializer
    queryset = ActivityLog.objects.all()
    filterset_fields = ['action', 'object_type', 'username']
    search_fields = ['username', 'object_repr', 'action']
