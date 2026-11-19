from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.models import OrderedModel
from apps.common.validators import upload_testimonials, validate_image_file


class Testimonial(OrderedModel):
    client_name = models.CharField(max_length=150)
    client_position = models.CharField(max_length=150, blank=True)
    company_name = models.CharField(max_length=150, blank=True)
    client_image = models.ImageField(upload_to=upload_testimonials, blank=True, null=True,
                                     validators=[validate_image_file])
    testimonial_text = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(5)])
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.client_name
