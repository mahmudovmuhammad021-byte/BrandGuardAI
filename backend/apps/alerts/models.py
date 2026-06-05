from django.db import models


class Alert(models.Model):
    TYPE_CHOICES = [
        ('critical', 'Critical'),
        ('warning',  'Warning'),
        ('info',     'Info'),
    ]

    alert_type  = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    title       = models.CharField(max_length=200)
    description = models.TextField()
    is_read     = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.alert_type.upper()}] {self.title}"

    @property
    def icon(self):
        return {'critical': '🚨', 'warning': '⚠️', 'info': 'ℹ️'}.get(self.alert_type, '🔔')

    @property
    def time_ago(self):
        from django.utils import timezone
        from datetime import timedelta
        delta = timezone.now() - self.created_at
        if delta.seconds < 60:
            return 'Just now'
        if delta.seconds < 3600:
            return f"{delta.seconds // 60} min ago"
        if delta.days == 0:
            return f"{delta.seconds // 3600} hr ago"
        return f"{delta.days}d ago"
