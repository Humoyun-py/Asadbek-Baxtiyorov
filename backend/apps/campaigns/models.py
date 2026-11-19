from django.db import models

from apps.common.models import OrderedModel, TimeStampedModel
from apps.common.validators import upload_campaigns, validate_image_file


class Campaign(OrderedModel, TimeStampedModel):
    title = models.CharField(max_length=100, help_text='Short name, e.g. TPU')
    university_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    role = models.CharField(max_length=300, blank=True)
    points = models.JSONField(default=list, blank=True, help_text='List of bullet strings')
    followers_count = models.PositiveIntegerField(null=True, blank=True)
    # Per-campaign ad metrics are nullable: only fill what is actually known.
    advertising_budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    impressions = models.PositiveBigIntegerField(null=True, blank=True)
    clicks = models.PositiveIntegerField(null=True, blank=True)
    leads = models.PositiveIntegerField(null=True, blank=True)
    cpc = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    cpm = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    cost_per_lead = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    campaign_image = models.ImageField(upload_to=upload_campaigns, blank=True, null=True,
                                       validators=[validate_image_file])
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.title


class CampaignStatistic(OrderedModel):
    """A labelled figure belonging to one specific campaign."""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='statistics')
    title = models.CharField(max_length=150, help_text='Label, e.g. "TOP yo\'nalish"')
    value = models.DecimalField(max_digits=16, decimal_places=2)
    prefix = models.CharField(max_length=10, blank=True)
    suffix = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f'{self.campaign}: {self.title}'


class CampaignImage(OrderedModel):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to=upload_campaigns, validators=[validate_image_file])
    caption = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['display_order', 'id']
