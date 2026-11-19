from django.contrib.auth import password_validation
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import ActivityLog, User


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active',
                  'is_staff', 'date_joined', 'last_login']
        read_only_fields = ['id', 'is_staff', 'date_joined', 'last_login']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']


class UserWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'password',
                  'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'Password is required.'})
        return attrs

    def create(self, validated):
        password = validated.pop('password')
        user = User(**validated)
        user.set_password(password)
        user.is_staff = user.role in (User.Role.ADMIN, User.Role.SUPERADMIN)
        user.save()
        return user

    def update(self, instance, validated):
        password = validated.pop('password', None)
        for k, v in validated.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.is_staff = instance.role in (User.Role.ADMIN, User.Role.SUPERADMIN)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate_new_password(self, value):
        password_validation.validate_password(value, self.context['request'].user)
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(attrs['uid'])), is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError({'uid': 'Invalid reset link.'})
        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({'token': 'Invalid or expired reset link.'})
        password_validation.validate_password(attrs['new_password'], user)
        attrs['user'] = user
        return attrs


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'username', 'action', 'object_type', 'object_id', 'object_repr', 'created_at']


def make_reset_uid_token(user):
    return urlsafe_base64_encode(force_bytes(user.pk)), default_token_generator.make_token(user)
