from rest_framework import serializers

from .models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'client_name', 'client_position', 'company_name', 'client_image', 'testimonial_text',
                  'rating', 'is_published', 'display_order', 'created_at']
        read_only_fields = ['id', 'created_at']
