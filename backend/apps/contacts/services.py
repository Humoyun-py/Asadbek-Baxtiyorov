import re
from datetime import timedelta

from django.utils import timezone

from .models import ContactMessage

LINK_RE = re.compile(r'(https?://|www\.|t\.me/)', re.I)


def looks_like_spam(data):
    """Cheap heuristics: many links, or the same message re-sent recently."""
    if len(LINK_RE.findall(data['message'])) >= 3:
        return True
    recent = timezone.now() - timedelta(minutes=10)
    return ContactMessage.objects.filter(created_at__gte=recent, message=data['message'],
                                         full_name=data['full_name']).exists()
