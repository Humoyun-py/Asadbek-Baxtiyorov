import io
import shutil
import tempfile

from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase

from apps.accounts.models import User

TEST_MEDIA = tempfile.mkdtemp(prefix='portfolio-test-media-')


def make_image(name='test.png', fmt='PNG', size=(20, 20)):
    buf = io.BytesIO()
    Image.new('RGB', size, (10, 80, 200)).save(buf, fmt)
    ctype = {'PNG': 'image/png', 'JPEG': 'image/jpeg', 'WEBP': 'image/webp'}[fmt]
    return SimpleUploadedFile(name, buf.getvalue(), content_type=ctype)


@override_settings(MEDIA_ROOT=TEST_MEDIA)
class BaseAPITest(APITestCase):
    password = 'Str0ng-Test-Pass-123'

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEST_MEDIA, ignore_errors=True)

    def setUp(self):
        cache.clear()  # reset throttles
        self.superadmin = User.objects.create_user('root', 'root@example.com', self.password, role='SUPERADMIN')
        self.admin = User.objects.create_user('adm', 'adm@example.com', self.password, role='ADMIN')
        self.editor = User.objects.create_user('edt', 'edt@example.com', self.password, role='EDITOR')

    def as_user(self, user):
        self.client.force_authenticate(user)

    def anonymous(self):
        self.client.force_authenticate(None)
