from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        SUPERADMIN = 'SUPERADMIN', 'Super admin'
        ADMIN = 'ADMIN', 'Admin'
        EDITOR = 'EDITOR', 'Editor'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=12, choices=Role.choices, default=Role.EDITOR)

    REQUIRED_FIELDS = ['email']

    def save(self, *args, **kwargs):
        # Django superusers are always SUPERADMIN; SUPERADMINs always get is_staff for /django-admin
        if self.is_superuser:
            self.role = self.Role.SUPERADMIN
        if self.role == self.Role.SUPERADMIN:
            self.is_staff = True
            self.is_superuser = True
        elif self.role in (self.Role.ADMIN, self.Role.EDITOR):
            self.is_superuser = False
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


class ActivityLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
                             related_name='activity_logs')
    username = models.CharField(max_length=150, blank=True)
    action = models.CharField(max_length=40, db_index=True)
    object_type = models.CharField(max_length=60, blank=True)
    object_id = models.CharField(max_length=40, blank=True)
    object_repr = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.username} {self.action} {self.object_type} {self.object_id}'
