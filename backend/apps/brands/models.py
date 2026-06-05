from django.db import models
from django.conf import settings


class Brand(models.Model):
    PROTECTION_CHOICES = [
        ('standard', 'Standard'),
        ('enhanced', 'Enhanced'),
        ('maximum',  'Maximum'),
    ]
    CATEGORY_CHOICES = [
        ('clothing',  'Kiyim-kechak'),
        ('perfumery', 'Parfumeriya'),
    ]

    name             = models.CharField(max_length=100)
    logo             = models.ImageField(upload_to='brands/logos/', null=True, blank=True)
    emoji            = models.CharField(max_length=8, default='📦')
    category         = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='clothing')
    protection_level = models.CharField(max_length=20, choices=PROTECTION_CHOICES, default='standard')
    owner            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='brands', null=True, blank=True)
    contact_email    = models.EmailField(blank=True)
    description      = models.TextField(blank=True)
    is_active        = models.BooleanField(default=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'brands'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def total_scans(self):
        return self.scans.count()

    @property
    def total_threats(self):
        return self.scans.filter(verdict='counterfeit').count()


class BrandReferenceImage(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='reference_images')
    image = models.ImageField(upload_to='brands/references/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'brand_reference_images'

