from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/brands/', include('apps.brands.urls')),
    path('api/scans/', include('apps.scans.urls')),
    path('api/alerts/', include('apps.alerts.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
