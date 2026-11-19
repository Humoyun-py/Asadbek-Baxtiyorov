from django.db import models

from apps.common.models import TimeStampedModel


class ContactMessage(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        IN_PROGRESS = 'IN_PROGRESS', 'In progress'
        COMPLETED = 'COMPLETED', 'Completed'
        SPAM = 'SPAM', 'Spam'

    full_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    telegram_username = models.CharField(max_length=64, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField(max_length=5000)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.NEW, db_index=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.full_name}: {self.subject}'
