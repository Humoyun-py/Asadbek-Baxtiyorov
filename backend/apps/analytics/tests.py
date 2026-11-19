from apps.analytics.models import AnalyticsEvent
from apps.common.testing import BaseAPITest
from apps.projects.models import Project, ProjectCategory


class AnalyticsTests(BaseAPITest):
    def setUp(self):
        super().setUp()
        cat = ProjectCategory.objects.create(name='C')
        self.p = Project.objects.create(title='Alpha', category=cat, short_description='s')

    def track(self, **kw):
        return self.client.post('/api/v1/analytics/track/', kw, format='json', HTTP_USER_AGENT='test-agent')

    def test_tracking_is_public_and_privacy_conscious(self):
        self.assertEqual(self.track(event_type='PAGE_VIEW', path='/').status_code, 204)
        self.assertEqual(self.track(event_type='PROJECT_VIEW', project='alpha').status_code, 204)
        e = AnalyticsEvent.objects.first()
        self.assertEqual(len(e.visitor_hash), 64)
        self.assertNotIn('127.0.0.1', e.visitor_hash)

    def test_rejects_bad_events(self):
        self.assertEqual(self.track(event_type='CONTACT_SUBMIT').status_code, 400)  # not client-submittable
        self.assertEqual(self.track(event_type='PROJECT_VIEW', project='nope').status_code, 400)

    def test_admin_endpoints_protected(self):
        for path in ('overview', 'visits', 'projects', 'contacts'):
            url = f'/api/v1/admin/analytics/{path}/'
            self.assertEqual(self.client.get(url).status_code, 401)
            self.as_user(self.editor)
            self.assertEqual(self.client.get(url).status_code, 403)
            self.anonymous()

    def test_aggregates(self):
        for _ in range(3):
            self.track(event_type='PAGE_VIEW')
        self.track(event_type='PROJECT_VIEW', project='alpha')
        self.as_user(self.admin)
        o = self.client.get('/api/v1/admin/analytics/overview/').data
        self.assertEqual((o['visits_total'], o['project_views_total'], o['projects_total']), (3, 1, 1))
        v = self.client.get('/api/v1/admin/analytics/visits/?days=7').data
        self.assertEqual(len(v['daily']), 7)
        self.assertEqual(sum(d['visits'] for d in v['daily']), 3)
        self.assertEqual(v['daily'][-1]['unique'], 1)
        self.assertEqual(self.client.get('/api/v1/admin/analytics/projects/').data[0]['title'], 'Alpha')
        c = self.client.get('/api/v1/admin/analytics/contacts/').data
        self.assertEqual(c['total'], 0)
