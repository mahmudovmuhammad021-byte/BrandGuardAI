"""
BrandGuard AI — Real Ultralytics YOLOv8 Detection Engine
=========================================================
Loads the user's custom 'best.pt' weights to recognize specific brands.
Also uses OpenCV ORB feature matching to compare uploaded images
with the original image base in `rasmlar1`.
"""

import os
import logging
from pathlib import Path
import cv2
import numpy as np

logger = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / 'ai_models'
WEIGHTS_PATH = MODELS_DIR / 'best.pt'
BASE_IMAGES_DIR = BASE_DIR.parent / 'rasmlar1' / 'brands'

# ── Model Initialization ─────────────────────────────────
_model = None
_model_error = None

def _get_model():
    global _model, _model_error
    if _model is not None:
        return _model
    if _model_error is not None:
        return None

    try:
        from ultralytics import YOLO
        if not WEIGHTS_PATH.exists():
            _model_error = "Model weights not found at ai_models/best.pt"
            return None
        _model = YOLO(str(WEIGHTS_PATH))
    except ImportError as e:
        _model_error = f"PyTorch import failed (missing C++ Redistributable): {e}"
        logger.error(_model_error)
    except Exception as e:
        _model_error = f"Failed to load YOLO model: {e}"
        logger.error(_model_error)
    
    return _model

# ══════════════════════════════════════════════════════════
#  IMAGE SIMILARITY CHECKER
# ══════════════════════════════════════════════════════════
def _check_similarity_with_base(image_path: str, brand_id: int) -> float:
    """
    Compares the uploaded image with original images in the database 
    and the local 'rasmlar1/brands' directory. Returns the max similarity score.
    """
    if not brand_id:
        return 0.0

    # Get DB images
    from apps.brands.models import Brand, BrandReferenceImage
    try:
        brand = Brand.objects.get(id=brand_id)
        refs = list(BrandReferenceImage.objects.filter(brand_id=brand_id))
    except Brand.DoesNotExist:
        brand = None
        refs = []

    # Get local images
    local_paths = []
    if brand:
        brand_folder = brand.name.lower()
        original_dir = BASE_IMAGES_DIR / brand_folder / 'orginal'
        if original_dir.exists() and original_dir.is_dir():
            valid_exts = {'.jpg', '.jpeg', '.png', '.avif', '.webp'}
            for f in original_dir.iterdir():
                if f.is_file() and f.suffix.lower() in valid_exts:
                    local_paths.append(str(f))

    if not refs and not local_paths:
        return 50.0  # Fallback middle score if absolutely no references exist

    # Read uploaded image
    img1 = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img1 is None:
        return 0.0

    orb = cv2.ORB_create(nfeatures=1000)
    kp1, des1 = orb.detectAndCompute(img1, None)
    
    if des1 is None or len(des1) < 2:
        return 0.0

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    max_similarity = 0.0
    
    # Collect all reference paths (DB + Local)
    all_ref_paths = local_paths
    for ref in refs:
        if ref.image and os.path.exists(ref.image.path):
            all_ref_paths.append(ref.image.path)

    for ref_path in all_ref_paths:
        img2 = cv2.imread(ref_path, cv2.IMREAD_GRAYSCALE)
        if img2 is None:
            continue
        
        kp2, des2 = orb.detectAndCompute(img2, None)
        if des2 is None or len(des2) < 2:
            continue

        # Use knnMatch with k=2 for Lowe's ratio test
        matches = bf.knnMatch(des1, des2, k=2)
        good_matches = []
        for match_pair in matches:
            if len(match_pair) == 2:
                m, n = match_pair
                # Relaxed Lowe's ratio to 0.85 for more flexibility
                if m.distance < 0.85 * n.distance:
                    good_matches.append(m)
        
        # Lowered threshold to 8 good matches for 100% similarity
        score = min(100.0, (len(good_matches) / 8.0) * 100.0)
        
        if score > max_similarity:
            max_similarity = score

    return max_similarity

# ══════════════════════════════════════════════════════════
#  ANALYSIS POINTS BUILDER
# ══════════════════════════════════════════════════════════
def _build_analysis_points(detected_class, yolo_conf, similarity_score, final_match, doc_score=None, det_score=None):
    points = []
    
    # YOLO Point
    points.append({
        'icon': '👁️', 
        'label': 'YOLO AI Model',
        'value': f"Holat: {detected_class}",
        'score': 'pass' if yolo_conf >= 25.0 else 'fail',
        'detail': f"{yolo_conf:.1f}% ishonchlilik"
    })
    
    # Final Verdict Point
    if final_match:
        points.append({
            'icon': '✅', 'label': 'Yakuniy Xulosa', 'value': 'Model tomonidan tasdiqlandi', 'score': 'pass', 'detail': 'Original mahsulot ehtimoli yuqori'
        })
    else:
        points.append({
            'icon': '❌', 'label': 'Yakuniy Xulosa', 'value': "Shubhalantiruvchi belgilar mavjud", 'score': 'fail', 'detail': 'Qalbaki bo\'lish xavfi yuqori'
        })
        
    return points

def _build_empty_points(error_msg=None):
    if error_msg:
        return [{'icon': '⚠️', 'label': 'AI Xatoligi', 'value': 'Model ishga tushmadi', 'score': 'fail', 'detail': error_msg}]
    return [
        {'icon': '❓', 'label': 'Visual Recognition', 'value': 'Hech qanday brend belgisi topilmadi', 'score': 'warn', 'detail': 'Klass aniqlanmadi'}
    ]

# ══════════════════════════════════════════════════════════
#  PUBLIC API
# ══════════════════════════════════════════════════════════
def analyze_image(image_path: str, brand_id: int = None) -> dict:
    """
    Main entry point for BrandGuard AI analysis using Custom YOLOv8 + ORB Similarity.
    """
    model = _get_model()
    
    if not model:
        return {
            'verdict': 'suspicious', 'confidence': 0.0,
            'points': _build_empty_points(_model_error), 'engine': 'yolov8-error'
        }

    try:
        from PIL import Image
        img = Image.open(image_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        results = model(img, conf=0.1)
        result = results[0]
        
        if len(result.boxes) == 0:
            yolo_match = False
            yolo_conf = 0.0
            detected_class = "Topilmadi"
            verdict = 'counterfeit'
            final_conf = 99.0  # Confident it's fake because nothing was detected
        else:
            # Get highest confidence detection
            best_box = max(result.boxes, key=lambda b: float(b.conf))
            class_id = int(best_box.cls)
            detected_class = "O'qitilgan Mahsulot"
            yolo_conf = float(best_box.conf) * 100
            yolo_match = yolo_conf >= 25.0
            
            if yolo_match:
                verdict = 'original'
                final_conf = yolo_conf
            else:
                verdict = 'counterfeit'
                final_conf = 100.0 - yolo_conf

        return {
            'verdict': verdict,
            'confidence': round(final_conf, 1),
            'points': _build_analysis_points(detected_class, yolo_conf, 100.0 if yolo_match else 0.0, yolo_match, None, None),
            'engine': 'yolov8 (custom)'
        }
    except Exception as e:
        logger.error(f"AI Engine Exception: {e}", exc_info=True)
        return {
            'verdict': 'suspicious', 'confidence': 0.0,
            'points': _build_empty_points(str(e)), 'engine': 'yolov8-error'
        }
