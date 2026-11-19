from .models import ActivityLog


def log_activity(user, action, object_type='', object_id='', object_repr=''):
    """Record an admin action. Never pass passwords/tokens in object_repr."""
    ActivityLog.objects.create(
        user=user if getattr(user, 'is_authenticated', False) else None,
        username=getattr(user, 'username', '') or '',
        action=action, object_type=object_type, object_id=str(object_id), object_repr=object_repr[:200],
    )
