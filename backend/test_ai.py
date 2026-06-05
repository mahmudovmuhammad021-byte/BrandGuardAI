import os
import django

# Setup django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'brandguard.settings')
django.setup()

from apps.scans.ai_engine import analyze_image

print(analyze_image(r'D:\Brand Guard\backend\media\scans\2026\06\download_1_ciNfRYf.jpg', 'Puma'))
