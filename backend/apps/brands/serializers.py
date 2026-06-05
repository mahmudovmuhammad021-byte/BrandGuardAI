from rest_framework import serializers
from .models import Brand, BrandReferenceImage

class BrandReferenceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandReferenceImage
        fields = ['id', 'image', 'uploaded_at']

class BrandSerializer(serializers.ModelSerializer):
    total_scans   = serializers.ReadOnlyField()
    total_threats = serializers.ReadOnlyField()
    reference_images = BrandReferenceImageSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model  = Brand
        fields = [
            'id', 'name', 'logo', 'emoji', 'category', 'protection_level',
            'contact_email', 'description', 'is_active',
            'total_scans', 'total_threats', 'created_at',
            'owner', 'reference_images', 'is_owner'
        ]
        read_only_fields = ['id', 'created_at', 'owner', 'is_active']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner_id == request.user.id
        return False

class BrandListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for dropdowns."""
    class Meta:
        model  = Brand
        fields = ['id', 'name', 'emoji', 'category']
