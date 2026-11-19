from apps.common.testing import BaseAPITest
from apps.services.models import Service


class ServiceTests(BaseAPITest):
    def setUp(self):
        super().setUp()
        self.on = Service.objects.create(title='Targeting', description='d')
        self.off = Service.objects.create(title='Hidden', description='d', is_active=False)

    def test_public_sees_only_active(self):
        r = self.client.get('/api/v1/services/')
        self.assertEqual([s['title'] for s in r.data], ['Targeting'])

    def test_crud_by_admin(self):
        self.as_user(self.admin)
        r = self.client.post('/api/v1/services/', {'title': 'SMM', 'description': 'x', 'icon': 'Megaphone'}, format='json')
        self.assertEqual(r.status_code, 201)
        sid = r.data['id']
        self.assertEqual(self.client.patch(f'/api/v1/services/{sid}/', {'is_active': False}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(f'/api/v1/services/{sid}/').status_code, 204)

    def test_editor_cannot_manage_services(self):
        self.as_user(self.editor)
        r = self.client.post('/api/v1/services/', {'title': 'X', 'description': 'x'}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_reorder(self):
        self.as_user(self.admin)
        self.client.post('/api/v1/services/reorder/', {'ids': [self.off.pk, self.on.pk]}, format='json')
        self.on.refresh_from_db()
        self.assertEqual(self.on.display_order, 1)
