from django.db import models
from django.utils.text import slugify

from apps.common.models import OrderedModel, TimeStampedModel
from apps.common.validators import upload_projects, validate_image_file


class ProjectCategory(OrderedModel):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True, blank=True)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name_plural = 'project categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or 'category'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


def unique_slug(model, value, instance=None, field='slug', max_length=180):
    base = (slugify(value) or 'item')[:max_length - 8]
    slug, n = base, 2
    qs = model.objects.all()
    if instance is not None and instance.pk:
        qs = qs.exclude(pk=instance.pk)
    while qs.filter(**{field: slug}).exists():
        slug = f'{base}-{n}'
        n += 1
    return slug


class Project(OrderedModel, TimeStampedModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    category = models.ForeignKey(ProjectCategory, on_delete=models.PROTECT, related_name='projects')
    badge = models.CharField(max_length=80, blank=True, help_text='Short label shown on the card')
    short_description = models.CharField(max_length=300)
    full_description = models.TextField(blank=True)
    client_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=300, blank=True)
    followers_count = models.PositiveIntegerField(null=True, blank=True)
    project_image = models.ImageField(upload_to=upload_projects, blank=True, null=True,
                                      validators=[validate_image_file])
    cover_image = models.ImageField(upload_to=upload_projects, blank=True, null=True,
                                    validators=[validate_image_file])
    project_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    telegram_url = models.URLField(blank=True)
    handle = models.CharField(max_length=100, blank=True, help_text='e.g. a Telegram bot handle')
    direction = models.CharField(max_length=300, blank=True)
    highlights = models.JSONField(default=list, blank=True, help_text='List of strings')
    extra_lists = models.JSONField(default=list, blank=True,
                                   help_text='List of {"title": str, "items": [str]}')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'id']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(Project, self.title, self)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProjectImage(OrderedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to=upload_projects, validators=[validate_image_file])
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f'{self.project} #{self.pk}'
