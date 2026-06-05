from rest_framework import serializers
from .models import Brand


class BrandSerializer(serializers.ModelSerializer):
    total_scans   = serializers.ReadOnlyField()
    total_threats = serializers.ReadOnlyField()

    class Meta:
        model  = Brand
        fields = [
            'id', 'name', 'emoji', 'category', 'protection_level',
            'contact_email', 'description', 'is_active',
            'total_scans', 'total_threats', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class BrandListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for dropdowns."""
    class Meta:
        model  = Brand
        fields = ['id', 'name', 'emoji', 'category']
