from django.db import models


class AnalyticsEvent(models.Model):
    class EventType(models.TextChoices):
        PAGE_VIEW = 'PAGE_VIEW', 'Page view'
        PROJECT_VIEW = 'PROJECT_VIEW', 'Project view'
        CONTACT_SUBMIT = 'CONTACT_SUBMIT', 'Contact submission'

    event_type = models.CharField(max_length=20, choices=EventType.choices, db_index=True)
    # Salted, daily-rotating hash: lets us count unique visitors per day without storing IP/UA.
    visitor_hash = models.CharField(max_length=64, blank=True, db_index=True)
    path = models.CharField(max_length=200, blank=True)
    project = models.ForeignKey('projects.Project', null=True, blank=True, on_delete=models.SET_NULL,
                                related_name='analytics_events')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['event_type', 'created_at'])]
