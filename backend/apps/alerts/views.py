from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Alert
from .serializers import AlertSerializer


class AlertViewSet(viewsets.ModelViewSet):
    queryset           = Alert.objects.all()
    serializer_class   = AlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['title', 'description']
    ordering           = ['-created_at']
    http_method_names  = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        qs = super().get_queryset()
        alert_type = self.request.query_params.get('type')
        unread     = self.request.query_params.get('unread')
        if alert_type:
            qs = qs.filter(alert_type=alert_type)
        if unread == 'true':
            qs = qs.filter(is_read=False)
        return qs

    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        """PATCH /api/alerts/{id}/read/"""
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        return Response(AlertSerializer(alert).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """POST /api/alerts/mark_all_read/"""
        Alert.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """GET /api/alerts/unread_count/"""
        count = Alert.objects.filter(is_read=False).count()
        return Response({'count': count})
