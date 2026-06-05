from ultralytics import YOLO
import os

model_path = r'D:\Brand Guard\backend\ai_models\best.pt'
model = YOLO(model_path)
print("Model classes:", model.names)
