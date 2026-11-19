from django.db import models

from apps.common.validators import upload_branding, validate_image_file


class WebsiteSettings(models.Model):
    """Singleton (pk=1): only one settings record can exist."""
    website_title = models.CharField(max_length=150, default='Asadbek Baxtiyorov')
    website_description = models.TextField(blank=True)
    logo = models.ImageField(upload_to=upload_branding, blank=True, null=True, validators=[validate_image_file])
    favicon = models.ImageField(upload_to=upload_branding, blank=True, null=True, validators=[validate_image_file])
    primary_color = models.CharField(max_length=7, default='#2f5bff')
    secondary_color = models.CharField(max_length=7, default='#62d8ff')
    telegram_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    footer_text = models.CharField(max_length=300, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=40, blank=True)
    contact_address = models.CharField(max_length=255, blank=True)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=170, blank=True)
    og_image = models.ImageField(upload_to=upload_branding, blank=True, null=True, validators=[validate_image_file])
    maintenance_mode = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'website settings'
        verbose_name_plural = 'website settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # the settings record can never be deleted

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'Website settings'
