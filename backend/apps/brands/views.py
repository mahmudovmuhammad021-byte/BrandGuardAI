from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Brand
from .serializers import BrandSerializer


class BrandViewSet(viewsets.ModelViewSet):
    queryset           = Brand.objects.filter(is_active=True)
    serializer_class   = BrandSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'category']
    ordering_fields    = ['name', 'created_at']
    ordering           = ['-created_at']
