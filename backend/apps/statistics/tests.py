from apps.common.testing import BaseAPITest
from apps.statistics.models import Statistic


class StatisticTests(BaseAPITest):
    def setUp(self):
        super().setUp()
        self.s = Statistic.objects.create(key='experience', title='Experience', value=2, suffix=' yil')
        Statistic.objects.create(key='hidden', title='Hidden', value=1, is_active=False)

    def test_public_active_only(self):
        r = self.client.get('/api/v1/statistics/')
        self.assertEqual([x['key'] for x in r.data], ['experience'])

    def test_admin_crud(self):
        self.as_user(self.admin)
        r = self.client.post('/api/v1/statistics/', {'key': 'k2', 'title': 'T', 'value': '12.50', 'category': 'GENERAL'},
                             format='json')
        self.assertEqual(r.status_code, 201, r.data)
        r = self.client.patch(f'/api/v1/statistics/{self.s.pk}/', {'value': '3'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.s.refresh_from_db()
        self.assertEqual(int(self.s.value), 3)

    def test_editor_forbidden(self):
        self.as_user(self.editor)
        self.assertEqual(self.client.patch(f'/api/v1/statistics/{self.s.pk}/', {'value': '9'}, format='json').status_code, 403)

    def test_seeded_budgets_stay_separate(self):
        from django.core.management import call_command
        call_command('seed_portfolio', verbosity=0)
        general = Statistic.objects.get(key='advertising-budget')
        uni = Statistic.objects.get(key='uni-ad-spend')
        self.assertEqual((int(general.value), general.category), (180000, 'GENERAL'))
        self.assertEqual((int(uni.value), uni.category), (29049, 'UNIVERSITY'))
