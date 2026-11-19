from django.core import mail
from rest_framework.test import APIClient

from apps.accounts.models import ActivityLog, User
from apps.common.testing import BaseAPITest


class AuthTests(BaseAPITest):
    def login(self, username='adm', password=None):
        return self.client.post('/api/v1/auth/login/', {'username': username, 'password': password or self.password})

    def test_login_returns_tokens_and_user(self):
        r = self.login()
        self.assertEqual(r.status_code, 200)
        self.assertIn('access', r.data)
        self.assertIn('refresh', r.data)
        self.assertEqual(r.data['user']['role'], 'ADMIN')
        self.assertTrue(ActivityLog.objects.filter(action='login', username='adm').exists())

    def test_login_wrong_password(self):
        self.assertEqual(self.login(password='nope').status_code, 401)

    def test_login_throttled(self):
        codes = [self.login(password='bad').status_code for _ in range(12)]
        self.assertIn(429, codes)

    def test_refresh_and_logout_blacklists(self):
        tokens = self.login().data
        r = self.client.post('/api/v1/auth/refresh/', {'refresh': tokens['refresh']})
        self.assertEqual(r.status_code, 200)
        new_refresh = r.data['refresh']
        # old refresh is blacklisted after rotation
        self.assertEqual(self.client.post('/api/v1/auth/refresh/', {'refresh': tokens['refresh']}).status_code, 401)
        c = APIClient()
        c.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")
        self.assertEqual(c.post('/api/v1/auth/logout/', {'refresh': new_refresh}).status_code, 204)
        self.assertEqual(self.client.post('/api/v1/auth/refresh/', {'refresh': new_refresh}).status_code, 401)

    def test_profile_requires_auth(self):
        self.assertEqual(self.client.get('/api/v1/auth/profile/').status_code, 401)
        self.as_user(self.editor)
        r = self.client.get('/api/v1/auth/profile/')
        self.assertEqual(r.data['username'], 'edt')

    def test_change_password(self):
        self.as_user(self.editor)
        bad = self.client.post('/api/v1/auth/change-password/', {'old_password': 'x', 'new_password': 'Another-Pass-9876'})
        self.assertEqual(bad.status_code, 400)
        weak = self.client.post('/api/v1/auth/change-password/', {'old_password': self.password, 'new_password': '123'})
        self.assertEqual(weak.status_code, 400)
        ok = self.client.post('/api/v1/auth/change-password/', {'old_password': self.password, 'new_password': 'Another-Pass-9876'})
        self.assertEqual(ok.status_code, 200)
        self.editor.refresh_from_db()
        self.assertTrue(self.editor.check_password('Another-Pass-9876'))

    def test_password_reset_flow(self):
        r = self.client.post('/api/v1/auth/password-reset/', {'email': 'edt@example.com'})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        body = mail.outbox[0].body
        uid = body.split('uid=')[1].split('&')[0]
        token = body.split('token=')[1].split()[0]
        r = self.client.post('/api/v1/auth/password-reset/confirm/',
                             {'uid': uid, 'token': token, 'new_password': 'Brand-New-Pass-4321'})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.login('edt', 'Brand-New-Pass-4321').status_code, 200)
        # token is single use
        again = self.client.post('/api/v1/auth/password-reset/confirm/',
                                 {'uid': uid, 'token': token, 'new_password': 'Other-New-Pass-4321'})
        self.assertEqual(again.status_code, 400)

    def test_password_reset_unknown_email_same_response(self):
        r = self.client.post('/api/v1/auth/password-reset/', {'email': 'nobody@example.com'})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_no_public_registration(self):
        r = self.client.post('/api/v1/admin/users/', {'username': 'x', 'email': 'x@x.com', 'password': 'Whatever-123456'})
        self.assertEqual(r.status_code, 401)


class UserManagementTests(BaseAPITest):
    def test_only_superadmin_manages_users(self):
        for u in (self.editor, self.admin):
            self.as_user(u)
            self.assertEqual(self.client.get('/api/v1/admin/users/').status_code, 403)
        self.as_user(self.superadmin)
        self.assertEqual(self.client.get('/api/v1/admin/users/').status_code, 200)

    def test_superadmin_creates_and_edits_user(self):
        self.as_user(self.superadmin)
        r = self.client.post('/api/v1/admin/users/', {'username': 'newbie', 'email': 'n@example.com',
                                                       'password': 'Newbie-Pass-12345', 'role': 'EDITOR'})
        self.assertEqual(r.status_code, 201, r.data)
        self.assertNotIn('password', r.data)
        u = User.objects.get(username='newbie')
        self.assertTrue(u.check_password('Newbie-Pass-12345'))
        self.assertFalse(u.is_superuser)
        r = self.client.patch(f'/api/v1/admin/users/{u.pk}/', {'role': 'ADMIN', 'is_active': False})
        self.assertEqual(r.status_code, 200)
        u.refresh_from_db()
        self.assertEqual((u.role, u.is_active), ('ADMIN', False))

    def test_cannot_delete_self(self):
        self.as_user(self.superadmin)
        self.assertEqual(self.client.delete(f'/api/v1/admin/users/{self.superadmin.pk}/').status_code, 400)

    def test_activity_log_access_and_no_secrets(self):
        self.as_user(self.superadmin)
        self.client.post('/api/v1/admin/users/', {'username': 'logme', 'email': 'l@example.com',
                                                   'password': 'Secret-Pass-12345', 'role': 'EDITOR'})
        r = self.client.get('/api/v1/admin/activity-logs/')
        self.assertEqual(r.status_code, 200)
        self.assertNotIn('Secret-Pass-12345', str(r.data))
        self.as_user(self.editor)
        self.assertEqual(self.client.get('/api/v1/admin/activity-logs/').status_code, 403)
