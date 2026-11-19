from apps.campaigns.models import Campaign, CampaignStatistic
from apps.common.testing import BaseAPITest, make_image


class CampaignTests(BaseAPITest):
    def setUp(self):
        super().setUp()
        self.c = Campaign.objects.create(title='TPU', university_name='Tashkent Perfect University', followers_count=104000)
        CampaignStatistic.objects.create(campaign=self.c, title="TOP yo'nalish", value=30)
        CampaignStatistic.objects.create(campaign=self.c, title='Off', value=1, is_active=False)
        self.off = Campaign.objects.create(title='OFF', university_name='Hidden', is_active=False)

    def test_public_listing_hides_inactive(self):
        r = self.client.get('/api/v1/campaigns/')
        self.assertEqual([c['title'] for c in r.data['results']], ['TPU'])
        self.assertEqual(len(r.data['results'][0]['statistics']), 1)  # inactive stat hidden
        self.assertEqual(self.client.get(f'/api/v1/campaigns/{self.off.pk}/').status_code, 404)

    def test_admin_crud_and_nullable_metrics(self):
        self.as_user(self.admin)
        r = self.client.post('/api/v1/campaigns/', {'title': 'NEW', 'university_name': 'Uni', 'leads': 10,
                                                    'cost_per_lead': '0.94'}, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertIsNone(r.data['impressions'])
        cid = r.data['id']
        self.assertEqual(self.client.patch(f'/api/v1/campaigns/{cid}/', {'clicks': 5}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(f'/api/v1/campaigns/{cid}/').status_code, 204)

    def test_campaign_statistics_crud(self):
        self.as_user(self.admin)
        r = self.client.post('/api/v1/campaign-statistics/', {'campaign': self.c.pk, 'title': 'Branches', 'value': '2'},
                             format='json')
        self.assertEqual(r.status_code, 201, r.data)
        sid = r.data['id']
        self.assertEqual(self.client.patch(f'/api/v1/campaign-statistics/{sid}/', {'value': '3'}, format='json').status_code, 200)
        self.assertEqual(self.client.get(f'/api/v1/campaign-statistics/?campaign={self.c.pk}').status_code, 200)

    def test_editor_forbidden(self):
        self.as_user(self.editor)
        r = self.client.post('/api/v1/campaigns/', {'title': 'X', 'university_name': 'Y'}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_campaign_image_upload(self):
        self.as_user(self.admin)
        r = self.client.patch(f'/api/v1/campaigns/{self.c.pk}/', {'campaign_image': make_image()}, format='multipart')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertIn('/campaigns/', r.data['campaign_image'])
        r = self.client.post(f'/api/v1/campaigns/{self.c.pk}/images/', {'images': [make_image('a.png')]}, format='multipart')
        self.assertEqual(r.status_code, 201)
