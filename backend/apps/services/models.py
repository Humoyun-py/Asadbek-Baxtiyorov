from django.db import models

from apps.common.models import OrderedModel, TimeStampedModel
from apps.projects.models import unique_slug


class Service(OrderedModel, TimeStampedModel):
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, help_text='Lucide icon name, e.g. Target')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'id']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(Service, self.title, self, max_length=160)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
