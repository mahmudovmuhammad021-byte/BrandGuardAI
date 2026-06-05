from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Brand, BrandReferenceImage
from .serializers import BrandSerializer


class BrandViewSet(viewsets.ModelViewSet):
    queryset           = Brand.objects.filter(is_active=True)
    serializer_class   = BrandSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'category']
    ordering_fields    = ['name', 'created_at']
    ordering           = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], url_path='upload_image')
    def upload_image(self, request, pk=None):
        brand = self.get_object()
        if brand.owner != request.user and request.user.role != 'admin':
            return Response({"detail": "Faqat brend egasi rasm yuklashi mumkin."}, status=status.HTTP_403_FORBIDDEN)
        
        image = request.FILES.get('image')
        if not image:
            return Response({"detail": "Rasm fayli yuborilmadi."}, status=status.HTTP_400_BAD_REQUEST)
        
        BrandReferenceImage.objects.create(brand=brand, image=image)
        return Response(BrandSerializer(brand, context={'request': request}).data)
