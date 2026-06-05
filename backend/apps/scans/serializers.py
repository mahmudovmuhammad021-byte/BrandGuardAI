from rest_framework import serializers
from .models import Scan, ScanAnalysisPoint
from apps.brands.serializers import BrandListSerializer


class ScanAnalysisPointSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ScanAnalysisPoint
        fields = ['icon', 'label', 'value', 'score', 'detail']


class ScanSerializer(serializers.ModelSerializer):
    analysis_points = ScanAnalysisPointSerializer(many=True, read_only=True)
    brand_info      = BrandListSerializer(source='brand', read_only=True)
    image_url       = serializers.SerializerMethodField()

    class Meta:
        model  = Scan
        fields = [
            'id', 'brand', 'brand_info', 'image', 'image_url',
            'verdict', 'confidence', 'engine', 'source',
            'notes', 'reported', 'scanned_by',
            'analysis_points', 'created_at',
        ]
        read_only_fields = ['id', 'verdict', 'confidence', 'engine', 'created_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ScanCreateSerializer(serializers.ModelSerializer):
    """Used for POST /api/scans/ — only accepts image + optional brand/source."""
    class Meta:
        model  = Scan
        fields = ['brand', 'image', 'source', 'notes']


class StatsSerializer(serializers.Serializer):
    total_scans    = serializers.IntegerField()
    counterfeits   = serializers.IntegerField()
    originals      = serializers.IntegerField()
    suspicious     = serializers.IntegerField()
    accuracy_pct   = serializers.FloatField()
    today_scans    = serializers.IntegerField()
    today_threats  = serializers.IntegerField()
    brands_protected = serializers.IntegerField()
    recent_verdicts  = serializers.ListField()
