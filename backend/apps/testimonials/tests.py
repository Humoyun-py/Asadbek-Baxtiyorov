from apps.common.testing import BaseAPITest
from apps.testimonials.models import Testimonial


class TestimonialTests(BaseAPITest):
    def test_empty_until_published(self):
        self.assertEqual(self.client.get('/api/v1/testimonials/').data, [])
        t = Testimonial.objects.create(client_name='C', testimonial_text='Great', is_published=False)
        self.assertEqual(self.client.get('/api/v1/testimonials/').data, [])
        self.as_user(self.admin)
        self.client.patch(f'/api/v1/testimonials/{t.pk}/', {'is_published': True}, format='json')
        self.anonymous()
        self.assertEqual(len(self.client.get('/api/v1/testimonials/').data), 1)

    def test_crud_and_rating_validation(self):
        self.as_user(self.admin)
        r = self.client.post('/api/v1/testimonials/', {'client_name': 'X', 'testimonial_text': 't', 'rating': 9}, format='json')
        self.assertEqual(r.status_code, 400)
        r = self.client.post('/api/v1/testimonials/', {'client_name': 'X', 'testimonial_text': 't', 'rating': 4}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(self.client.delete(f'/api/v1/testimonials/{r.data["id"]}/').status_code, 204)
        self.as_user(self.editor)
        self.assertEqual(self.client.post('/api/v1/testimonials/', {'client_name': 'Y', 'testimonial_text': 't'}, format='json').status_code, 403)
