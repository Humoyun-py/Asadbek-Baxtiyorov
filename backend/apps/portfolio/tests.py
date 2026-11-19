from django.core.management import call_command

from apps.campaigns.models import Campaign
from apps.common.testing import BaseAPITest
from apps.projects.models import Project
from apps.testimonials.models import Testimonial


class PortfolioTests(BaseAPITest):
    def test_profile_public_read_admin_write(self):
        self.assertEqual(self.client.get('/api/v1/portfolio/profile/').status_code, 200)
        self.assertEqual(self.client.patch('/api/v1/portfolio/profile/', {'full_name': 'X'}, format='json').status_code, 401)
        self.as_user(self.editor)
        self.assertEqual(self.client.patch('/api/v1/portfolio/profile/', {'full_name': 'X'}, format='json').status_code, 403)
        self.as_user(self.admin)
        r = self.client.patch('/api/v1/portfolio/profile/', {'agency_name': 'GTA', 'experience_years': 3}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['experience_years'], 3)

    def test_seed_is_idempotent_and_preserves_edits(self):
        call_command('seed_portfolio', verbosity=0)
        counts = (Project.objects.count(), Campaign.objects.count())
        self.assertEqual(counts, (11, 4))
        p = Project.objects.get(slug='kamerachi')
        p.short_description = 'Edited by admin'
        p.save()
        call_command('seed_portfolio', verbosity=0)
        self.assertEqual((Project.objects.count(), Campaign.objects.count()), counts)
        p.refresh_from_db()
        self.assertEqual(p.short_description, 'Edited by admin')
        self.assertEqual(Testimonial.objects.count(), 0)  # nothing fabricated
        self.assertFalse(Project.objects.exclude(project_url='').exists())

    def test_aggregate_endpoint_public_content_only(self):
        call_command('seed_portfolio', verbosity=0)
        Project.objects.filter(slug='kamerachi').update(is_published=False)
        r = self.client.get('/api/v1/portfolio/')
        self.assertEqual(r.status_code, 200)
        slugs = [p['slug'] for p in r.data['projects']]
        self.assertNotIn('kamerachi', slugs)
        self.assertEqual(len(r.data['services']), 4)
        self.assertEqual(r.data['testimonials'], [])
        self.assertEqual(r.data['profile']['agency_name'], 'Global Targeting Agency')
