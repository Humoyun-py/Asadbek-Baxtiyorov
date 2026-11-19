"""Create/update the SUPERADMIN from ADMIN_EMAIL / ADMIN_PASSWORD env vars (idempotent, for deploys)."""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Ensure a SUPERADMIN exists using ADMIN_EMAIL and ADMIN_PASSWORD environment variables.'

    def handle(self, *args, **options):
        email = os.environ.get('ADMIN_EMAIL', '').strip().lower()
        password = os.environ.get('ADMIN_PASSWORD', '')
        if not email or not password:
            self.stdout.write('ADMIN_EMAIL/ADMIN_PASSWORD not set - skipping.')
            return
        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first() or User(email=email, username=email)
        user.email = email
        user.is_active = True
        user.role = User.Role.SUPERADMIN
        user.set_password(password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f'Superadmin ready: {email}'))
