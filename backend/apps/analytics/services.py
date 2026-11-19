import hashlib

from django.conf import settings
from django.utils import timezone

from .models import AnalyticsEvent


def visitor_hash(request):
    """Privacy-conscious id: sha256(ip + user-agent + today's date + server secret). Rotates daily, so
    visitors can be counted per day but not tracked across days; no raw IP/UA is stored."""
    fwd = request.META.get('HTTP_X_FORWARDED_FOR', '')
    ip = fwd.split(',')[0].strip() if fwd else request.META.get('REMOTE_ADDR', '')
    ua = request.META.get('HTTP_USER_AGENT', '')
    raw = f'{ip}|{ua}|{timezone.localdate().isoformat()}|{settings.SECRET_KEY}'
    return hashlib.sha256(raw.encode()).hexdigest()


def record_event(event_type, request, path='', project=None):
    return AnalyticsEvent.objects.create(event_type=event_type, visitor_hash=visitor_hash(request),
                                         path=path[:200], project=project)
