"""Upload validation: never trust the extension alone — inspect the real image content."""
from django.conf import settings
from django.core.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
ALLOWED_FORMATS = {'JPEG', 'PNG', 'WEBP'}
MAX_PIXELS = 40_000_000


def validate_image_file(file):
    name = getattr(file, 'name', '') or ''
    ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError('Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP.')
    size = getattr(file, 'size', 0) or 0
    if size > settings.MAX_UPLOAD_SIZE:
        raise ValidationError(f'File too large. Maximum size is {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB.')
    try:
        pos = file.tell()
    except Exception:
        pos = 0
    try:
        file.seek(0)
        with Image.open(file) as img:
            fmt = img.format
            width, height = img.size
            img.verify()
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
        raise ValidationError('The uploaded file is not a valid image.')
    finally:
        try:
            file.seek(pos)
        except Exception:
            pass
    if fmt not in ALLOWED_FORMATS:
        raise ValidationError('Unsupported image content. Allowed: JPEG, PNG, WEBP.')
    if width * height > MAX_PIXELS:
        raise ValidationError('Image dimensions are too large.')
    # extension must agree with actual content
    expected = {'JPEG': {'jpg', 'jpeg'}, 'PNG': {'png'}, 'WEBP': {'webp'}}[fmt]
    if ext not in expected:
        raise ValidationError('File extension does not match the image content.')


def _mk(folder):
    import uuid

    def f(instance, filename):
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'bin'
        return f'{folder}/{uuid.uuid4().hex}.{ext}'
    return f


def upload_profile(instance, filename):
    return _mk('profile')(instance, filename)


def upload_projects(instance, filename):
    return _mk('projects')(instance, filename)


def upload_campaigns(instance, filename):
    return _mk('campaigns')(instance, filename)


def upload_testimonials(instance, filename):
    return _mk('testimonials')(instance, filename)


def upload_branding(instance, filename):
    return _mk('branding')(instance, filename)
