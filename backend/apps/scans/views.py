from django.utils import timezone
from django.db.models import Count, Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Scan, ScanAnalysisPoint
from .serializers import ScanSerializer, ScanCreateSerializer, StatsSerializer
from .ai_engine import analyze_image
from apps.brands.models import Brand
from apps.alerts.models import Alert


class ScanViewSet(viewsets.ModelViewSet):
    queryset           = Scan.objects.select_related('brand').prefetch_related('analysis_points')
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['brand__name', 'verdict', 'source']
    ordering_fields    = ['created_at', 'confidence']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ScanCreateSerializer
        return ScanSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        verdict = self.request.query_params.get('verdict')
        brand   = self.request.query_params.get('brand')
        if verdict:
            qs = qs.filter(verdict=verdict)
        if brand:
            qs = qs.filter(brand_id=brand)
        return qs

    def create(self, request, *args, **kwargs):
        """
        POST /api/scans/
        Upload image → AI analysis → save result → return full scan data.
        """
        serializer = ScanCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save scan record (without verdict yet)
        scan = serializer.save(
            scanned_by=request.user.email,
            verdict='suspicious',  # Temporary
            confidence=0,
        )

        # Run AI engine
        try:
            brand_id = scan.brand_id if scan.brand else None
            result = analyze_image(
                image_path=scan.image.path,
                brand_id=brand_id
            )
        except Exception as e:
            scan.delete()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Update scan with AI result
        scan.verdict    = result['verdict']
        scan.confidence = result['confidence']
        scan.engine     = result['engine']
        scan.save()

        # Save analysis points
        for i, pt in enumerate(result.get('points', [])):
            ScanAnalysisPoint.objects.create(
                scan=scan, order=i,
                icon=pt['icon'], label=pt['label'],
                value=pt['value'], score=pt['score'],
                detail=pt.get('detail', ''),
            )

        # Auto-create alert for counterfeits
        if result['verdict'] == 'counterfeit':
            brand_name = scan.brand.name if scan.brand else 'Unknown brand'
            Alert.objects.create(
                alert_type='critical',
                title=f"Counterfeit detected — {brand_name}",
                description=(
                    f"A counterfeit product was detected with "
                    f"{result['confidence']:.1f}% confidence via {scan.source}. "
                    f"Engine: {result['engine']}."
                ),
            )

        # Return full serialized scan
        full = ScanSerializer(scan, context={'request': request})
        return Response(full.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """GET /api/scans/stats/ — Dashboard aggregates."""
        today    = timezone.now().date()
        all_scans = Scan.objects.all()

        total      = all_scans.count()
        counterfeits = all_scans.filter(verdict='counterfeit').count()
        originals    = all_scans.filter(verdict='original').count()
        suspicious   = all_scans.filter(verdict='suspicious').count()
        today_scans  = all_scans.filter(created_at__date=today).count()
        today_threats= all_scans.filter(created_at__date=today, verdict='counterfeit').count()
        brands_prot  = Brand.objects.filter(is_active=True).count()

        accuracy_pct = round((originals / total * 100), 1) if total > 0 else 0

        # Last 7 days activity
        from datetime import timedelta
        recent = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_scans = all_scans.filter(created_at__date=day)
            recent.append({
                'date':        day.strftime('%a'),
                'scans':       day_scans.count(),
                'counterfeits':day_scans.filter(verdict='counterfeit').count(),
            })

        data = {
            'total_scans':      total,
            'counterfeits':     counterfeits,
            'originals':        originals,
            'suspicious':       suspicious,
            'accuracy_pct':     accuracy_pct,
            'today_scans':      today_scans,
            'today_threats':    today_threats,
            'brands_protected': brands_prot,
            'recent_verdicts':  recent,
        }
        return Response(data)

    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        """POST /api/scans/{id}/report/ — Mark scan as reported."""
        scan = self.get_object()
        scan.reported = True
        scan.save()
        return Response({'status': 'reported'})
