"""
BrandGuard AI — Seed initial data
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed BrandGuard AI with initial demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING('Seeding BrandGuard AI...'))

        # ── Users ──────────────────────────────────────────
        if not User.objects.filter(email='admin@brandguard.uz').exists():
            User.objects.create_superuser(
                email='admin@brandguard.uz',
                password='admin123',
                full_name='Admin User',
            )
            self.stdout.write(self.style.SUCCESS('Admin user created: admin@brandguard.uz / admin123'))

        # ── Brands ─────────────────────────────────────────
        from apps.brands.models import Brand
        brands = [
            {'name': 'Artel',        'emoji': '📺', 'category': 'electronics',   'protection_level': 'maximum',  'contact_email': 'protect@artel.uz'},
            {'name': 'Cosmo',        'emoji': '💄', 'category': 'cosmetics',     'protection_level': 'enhanced', 'contact_email': 'legal@cosmo.uz'},
            {'name': 'Milliy Yuk',   'emoji': '👟', 'category': 'clothing',      'protection_level': 'standard', 'contact_email': 'info@milliy.uz'},
            {'name': 'Sarbon',       'emoji': '🍫', 'category': 'food_beverage', 'protection_level': 'standard', 'contact_email': 'info@sarbon.uz'},
            {'name': 'Orzugul',      'emoji': '💊', 'category': 'pharma',        'protection_level': 'maximum',  'contact_email': 'legal@orzugul.uz'},
            {'name': 'Zamin Fruits', 'emoji': '🍎', 'category': 'food_beverage', 'protection_level': 'standard', 'contact_email': 'info@zamin.uz'},
            {'name': 'Bravo Market', 'emoji': '🛒', 'category': 'retail',        'protection_level': 'enhanced', 'contact_email': 'protect@bravo.uz'},
            {'name': 'Hamkor Tex',   'emoji': '🔧', 'category': 'electronics',   'protection_level': 'standard', 'contact_email': 'legal@hamkor.uz'},
        ]
        for b in brands:
            Brand.objects.get_or_create(name=b['name'], defaults=b)
        self.stdout.write(self.style.SUCCESS(f'{len(brands)} brands seeded'))

        # ── Alerts ─────────────────────────────────────────
        from apps.alerts.models import Alert
        alerts = [
            {
                'alert_type': 'critical',
                'title': 'Counterfeit cluster detected — Artel TVs',
                'description': '6 fake Artel TV units identified across Olx.uz within 2 hours. Seller: @tech_deals_uz',
            },
            {
                'alert_type': 'critical',
                'title': 'Pharmaceutical counterfeit alert — Orzugul',
                'description': 'Orzugul Paracetamol with altered QR codes detected at Yunusobod bazaar.',
            },
            {
                'alert_type': 'warning',
                'title': 'Suspicious Cosmo products on Telegram',
                'description': 'Channel @cosmo_sale is selling products with inconsistent logo fonts.',
            },
            {
                'alert_type': 'warning',
                'title': 'New pattern: packaging mismatch — Sarbon',
                'description': 'Sarbon chocolate wrappers with wrong barcode format at 3 retail locations.',
            },
            {
                'alert_type': 'info',
                'title': 'Brand database updated successfully',
                'description': '124 new product signatures added to the verification database.',
                'is_read': True,
            },
        ]
        Alert.objects.all().delete()
        for a in alerts:
            Alert.objects.create(**a)
        self.stdout.write(self.style.SUCCESS(f'{len(alerts)} alerts seeded'))

        self.stdout.write(self.style.SUCCESS('\nBrandGuard AI is ready!'))
        self.stdout.write('   Login: admin@brandguard.uz | Password: admin123')
