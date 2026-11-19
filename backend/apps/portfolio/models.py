from django.db import models

from apps.common.validators import upload_profile, validate_image_file


class PortfolioProfile(models.Model):
    """Singleton: the owner's main personal information."""
    full_name = models.CharField(max_length=150, default='Asadbek Baxtiyorov')
    professional_title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    biography = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to=upload_profile, blank=True, null=True,
                                      validators=[validate_image_file])
    experience_years = models.PositiveIntegerField(default=2)
    projects_count = models.CharField(max_length=20, default='10+', help_text='Shown as text, e.g. "10+"')
    advertising_budget = models.CharField(max_length=40, default='$180 000+',
                                          help_text='General advertising budget as text, e.g. "$180 000+"')
    agency_name = models.CharField(max_length=150, blank=True)
    telegram_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.pk = 1  # singleton
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.full_name
