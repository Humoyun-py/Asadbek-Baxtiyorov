from apps.common.testing import BaseAPITest, make_image
from apps.website_settings.models import WebsiteSettings


class SettingsTests(BaseAPITest):
    def test_public_get_creates_singleton(self):
        r = self.client.get('/api/v1/settings/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(WebsiteSettings.objects.count(), 1)

    def test_only_superadmin_can_patch(self):
        for u in (self.editor, self.admin):
            self.as_user(u)
            self.assertEqual(self.client.patch('/api/v1/settings/', {'website_title': 'x'}, format='json').status_code, 403)
        self.anonymous()
        self.assertEqual(self.client.patch('/api/v1/settings/', {'website_title': 'x'}, format='json').status_code, 401)
        self.as_user(self.superadmin)
        r = self.client.patch('/api/v1/settings/', {'website_title': 'New Title', 'maintenance_mode': True}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertTrue(WebsiteSettings.load().maintenance_mode)

    def test_single_record_and_color_validation(self):
        WebsiteSettings.load()
        WebsiteSettings(website_title='Second').save()
        self.assertEqual(WebsiteSettings.objects.count(), 1)
        WebsiteSettings.load().delete()
        self.assertEqual(WebsiteSettings.objects.count(), 1)
        self.as_user(self.superadmin)
        self.assertEqual(self.client.patch('/api/v1/settings/', {'primary_color': 'red'}, format='json').status_code, 400)

    def test_logo_upload(self):
        self.as_user(self.superadmin)
        r = self.client.patch('/api/v1/settings/', {'logo': make_image('logo.png')}, format='multipart')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertIn('/branding/', r.data['logo'])
