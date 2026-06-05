from rest_framework import serializers
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    icon     = serializers.ReadOnlyField()
    time_ago = serializers.ReadOnlyField()

    class Meta:
        model  = Alert
        fields = ['id', 'alert_type', 'icon', 'title', 'description',
                  'is_read', 'time_ago', 'created_at']
        read_only_fields = ['id', 'created_at']
