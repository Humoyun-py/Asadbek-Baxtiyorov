from django.db import models

from apps.common.models import OrderedModel, TimeStampedModel


class Statistic(OrderedModel, TimeStampedModel):
    """Global statistics. GENERAL = whole-portfolio figures; UNIVERSITY = totals of the university
    campaigns (kept separate on purpose: the $180,000+ general budget is NOT the $29,049 campaign budget)."""

    class Category(models.TextChoices):
        GENERAL = 'GENERAL', 'General portfolio'
        UNIVERSITY = 'UNIVERSITY', 'University campaigns'

    key = models.SlugField(max_length=60, unique=True, help_text='Stable identifier used by the website')
    title = models.CharField(max_length=150)
    value = models.DecimalField(max_digits=16, decimal_places=2)
    prefix = models.CharField(max_length=10, blank=True)
    suffix = models.CharField(max_length=20, blank=True)
    description = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=12, choices=Category.choices, default=Category.GENERAL)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'display_order', 'id']

    def __str__(self):
        return self.title
