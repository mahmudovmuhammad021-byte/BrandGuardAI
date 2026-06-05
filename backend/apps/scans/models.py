from django.db import models
from apps.brands.models import Brand


class Scan(models.Model):
    VERDICT_CHOICES = [
        ('original',    'Original'),
        ('counterfeit', 'Counterfeit'),
        ('suspicious',  'Suspicious'),
    ]
    ENGINE_CHOICES = [
        ('yolov8',     'YOLOv8'),
        ('simulation', 'Simulation'),
    ]

    brand      = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='scans')
    image      = models.ImageField(upload_to='scans/%Y/%m/')
    verdict    = models.CharField(max_length=20, choices=VERDICT_CHOICES)
    confidence = models.FloatField()           # 0.0 – 100.0
    engine     = models.CharField(max_length=20, choices=ENGINE_CHOICES, default='simulation')
    source     = models.CharField(max_length=50, default='Manual')
    notes      = models.TextField(blank=True)
    reported   = models.BooleanField(default=False)
    scanned_by = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scans'
        ordering = ['-created_at']

    def __str__(self):
        return f"Scan #{self.pk} — {self.verdict} ({self.confidence:.1f}%)"


class ScanAnalysisPoint(models.Model):
    """Individual analysis breakdown per scan."""
    SCORE_CHOICES = [('pass', 'Pass'), ('warn', 'Warning'), ('fail', 'Fail')]

    scan   = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name='analysis_points')
    icon   = models.CharField(max_length=8)
    label  = models.CharField(max_length=50)
    value  = models.CharField(max_length=100)
    score  = models.CharField(max_length=10, choices=SCORE_CHOICES)
    detail = models.CharField(max_length=100, blank=True)
    order  = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'scan_analysis_points'
        ordering = ['order']
