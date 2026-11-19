from apps.analytics.models import AnalyticsEvent
from apps.common.testing import BaseAPITest
from apps.contacts.models import ContactMessage

VALID = {'full_name': 'Ali Valiyev', 'telegram_username': '@ali_vali', 'subject': 'Reklama', 'message': 'Salom, reklama kerak.'}


class ContactTests(BaseAPITest):
    def test_public_can_submit(self):
        r = self.client.post('/api/v1/contacts/', VALID, format='json')
        self.assertEqual(r.status_code, 201)
        m = ContactMessage.objects.get()
        self.assertEqual(m.status, 'NEW')
        self.assertEqual(AnalyticsEvent.objects.filter(event_type='CONTACT_SUBMIT').count(), 1)

    def test_validation(self):
        self.assertEqual(self.client.post('/api/v1/contacts/', {**VALID, 'telegram_username': ''}, format='json').status_code, 400)  # no contact method
        self.assertEqual(self.client.post('/api/v1/contacts/', {**VALID, 'email': 'bad'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/v1/contacts/', {**VALID, 'telegram_username': 'a b!'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/v1/contacts/', {**VALID, 'message': ''}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/v1/contacts/', {**VALID, 'phone': 'abc', 'telegram_username': ''}, format='json').status_code, 400)

    def test_honeypot_stores_nothing(self):
        r = self.client.post('/api/v1/contacts/', {**VALID, 'website': 'http://spam'}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_link_spam_and_duplicates_marked_spam(self):
        links = 'http://a.com http://b.com https://c.com'
        self.client.post('/api/v1/contacts/', {**VALID, 'message': links}, format='json')
        self.assertEqual(ContactMessage.objects.get().status, 'SPAM')
        ContactMessage.objects.all().delete()
        self.client.post('/api/v1/contacts/', VALID, format='json')
        self.client.post('/api/v1/contacts/', VALID, format='json')
        self.assertEqual(ContactMessage.objects.filter(status='SPAM').count(), 1)

    def test_rate_limited(self):
        codes = [self.client.post('/api/v1/contacts/', {**VALID, 'message': f'message number {i}'}, format='json').status_code
                 for i in range(7)]
        self.assertEqual(codes[:5], [201] * 5)
        self.assertIn(429, codes[5:])

    def test_messages_never_public(self):
        ContactMessage.objects.create(full_name='A', email='a@a.com', subject='s', message='private message')
        self.assertEqual(self.client.get('/api/v1/contacts/').status_code, 401)
        self.as_user(self.editor)
        self.assertEqual(self.client.get('/api/v1/contacts/').status_code, 403)

    def test_admin_manage(self):
        m = ContactMessage.objects.create(full_name='Bob', email='b@b.com', subject='Hello', message='Need help')
        ContactMessage.objects.create(full_name='Eve', email='e@e.com', subject='Other', message='x', status='SPAM')
        self.as_user(self.admin)
        self.assertEqual(self.client.get('/api/v1/contacts/').data['count'], 2)
        self.assertEqual(self.client.get('/api/v1/contacts/?status=SPAM').data['count'], 1)
        self.assertEqual(self.client.get('/api/v1/contacts/?search=help').data['count'], 1)
        self.assertEqual(self.client.get(f'/api/v1/contacts/{m.pk}/').status_code, 200)
        r = self.client.patch(f'/api/v1/contacts/{m.pk}/', {'status': 'IN_PROGRESS', 'message': 'tampered'}, format='json')
        self.assertEqual(r.status_code, 200)
        m.refresh_from_db()
        self.assertEqual((m.status, m.message), ('IN_PROGRESS', 'Need help'))  # only status editable
        self.assertEqual(self.client.delete(f'/api/v1/contacts/{m.pk}/').status_code, 204)
