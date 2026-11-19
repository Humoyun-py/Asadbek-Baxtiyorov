from apps.common.testing import BaseAPITest, make_image
from apps.projects.models import Project, ProjectCategory


class ProjectTests(BaseAPITest):
    def setUp(self):
        super().setUp()
        self.cat = ProjectCategory.objects.create(name='Education')
        self.pub = Project.objects.create(title='Public One', category=self.cat, short_description='s', is_published=True)
        self.draft = Project.objects.create(title='Draft One', category=self.cat, short_description='s', is_published=False)

    def payload(self, **kw):
        d = {'title': 'New Project', 'category': self.cat.pk, 'short_description': 'short'}
        d.update(kw)
        return d

    def test_public_sees_only_published(self):
        r = self.client.get('/api/v1/projects/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual([p['slug'] for p in r.data['results']], ['public-one'])
        self.assertEqual(self.client.get('/api/v1/projects/draft-one/').status_code, 404)
        self.assertEqual(self.client.get('/api/v1/projects/public-one/').status_code, 200)

    def test_staff_sees_drafts(self):
        self.as_user(self.editor)
        r = self.client.get('/api/v1/projects/')
        self.assertEqual(len(r.data['results']), 2)

    def test_public_cannot_write(self):
        self.assertEqual(self.client.post('/api/v1/projects/', self.payload(), format='json').status_code, 401)

    def test_editor_can_create_edit_not_delete(self):
        self.as_user(self.editor)
        r = self.client.post('/api/v1/projects/', self.payload(), format='json')
        self.assertEqual(r.status_code, 201, r.data)
        pid = r.data['id']
        self.assertEqual(r.data['slug'], 'new-project')
        self.assertEqual(self.client.patch(f'/api/v1/projects/{pid}/', {'title': 'Renamed'}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(f'/api/v1/projects/{pid}/').status_code, 403)

    def test_admin_can_delete(self):
        self.as_user(self.admin)
        r = self.client.delete(f'/api/v1/projects/{self.pub.pk}/')
        self.assertEqual(r.status_code, 204)

    def test_unique_slug_generation(self):
        self.as_user(self.admin)
        a = self.client.post('/api/v1/projects/', self.payload(title='Same Name'), format='json')
        b = self.client.post('/api/v1/projects/', self.payload(title='Same Name'), format='json')
        self.assertNotEqual(a.data['slug'], b.data['slug'])

    def test_publish_unpublish_toggle(self):
        self.as_user(self.admin)
        self.client.patch(f'/api/v1/projects/{self.draft.pk}/', {'is_published': True}, format='json')
        self.anonymous()
        self.assertEqual(self.client.get('/api/v1/projects/draft-one/').status_code, 200)

    def test_search_filter_pagination(self):
        other = ProjectCategory.objects.create(name='AI')
        Project.objects.create(title='Robot App', category=other, short_description='x')
        r = self.client.get('/api/v1/projects/?search=robot')
        self.assertEqual(r.data['count'], 1)
        r = self.client.get(f'/api/v1/projects/?category={other.pk}')
        self.assertEqual(r.data['count'], 1)
        r = self.client.get('/api/v1/projects/?page_size=1')
        self.assertEqual(len(r.data['results']), 1)
        self.assertEqual(r.data['count'], 2)

    def test_date_validation(self):
        self.as_user(self.admin)
        r = self.client.post('/api/v1/projects/', self.payload(start_date='2025-05-01', end_date='2025-01-01'), format='json')
        self.assertEqual(r.status_code, 400)

    def test_highlights_validation(self):
        self.as_user(self.admin)
        r = self.client.post('/api/v1/projects/', self.payload(highlights='nope'), format='json')
        self.assertEqual(r.status_code, 400)

    def test_image_upload_and_gallery(self):
        self.as_user(self.editor)
        r = self.client.patch(f'/api/v1/projects/{self.pub.pk}/', {'project_image': make_image()}, format='multipart')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertIn('/projects/', r.data['project_image'])
        r = self.client.post(f'/api/v1/projects/{self.pub.pk}/images/',
                             {'images': [make_image('a.png'), make_image('b.jpg', 'JPEG')]}, format='multipart')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(len(r.data), 2)
        img_id = r.data[0]['id']
        r = self.client.post(f'/api/v1/projects/{self.pub.pk}/set-cover/', {'image_id': img_id}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data['cover_image'])
        self.assertEqual(len(r.data['gallery']), 2)
        r = self.client.delete(f'/api/v1/projects/{self.pub.pk}/images/{r.data["gallery"][1]["id"]}/')
        self.assertEqual(r.status_code, 204)
        self.assertEqual(self.pub.gallery.count(), 1)

    def test_upload_rejects_fake_and_wrong_files(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        self.as_user(self.editor)
        url = f'/api/v1/projects/{self.pub.pk}/'
        fake = SimpleUploadedFile('evil.png', b'<?php echo 1; ?>', content_type='image/png')
        self.assertEqual(self.client.patch(url, {'project_image': fake}, format='multipart').status_code, 400)
        exe = SimpleUploadedFile('a.exe', b'MZ...', content_type='application/octet-stream')
        self.assertEqual(self.client.patch(url, {'project_image': exe}, format='multipart').status_code, 400)
        mismatch = make_image('photo.jpg', 'PNG')  # PNG content with .jpg name
        self.assertEqual(self.client.patch(url, {'project_image': mismatch}, format='multipart').status_code, 400)
        gif_buf = make_image('x.gif', 'PNG')
        self.assertEqual(self.client.patch(url, {'project_image': gif_buf}, format='multipart').status_code, 400)

    def test_upload_rejects_oversized(self):
        from django.test import override_settings
        self.as_user(self.editor)
        with override_settings(MAX_UPLOAD_SIZE=100):
            r = self.client.patch(f'/api/v1/projects/{self.pub.pk}/', {'project_image': make_image(size=(200, 200))},
                                  format='multipart')
        self.assertEqual(r.status_code, 400)

    def test_reorder(self):
        self.as_user(self.editor)
        r = self.client.post('/api/v1/projects/reorder/', {'ids': [self.draft.pk, self.pub.pk]}, format='json')
        self.assertEqual(r.status_code, 200)
        self.pub.refresh_from_db(); self.draft.refresh_from_db()
        self.assertEqual((self.draft.display_order, self.pub.display_order), (0, 1))

    def test_category_delete_protected(self):
        self.as_user(self.admin)
        self.assertEqual(self.client.delete(f'/api/v1/project-categories/{self.cat.pk}/').status_code, 400)
        self.anonymous()
        self.assertEqual(self.client.get('/api/v1/project-categories/').status_code, 200)
