import sys
import os

print("⏳ Initializing PyTorch and loading AI libraries... (This takes about 5-10 seconds on a Mac)")

import torch
import cv2
import json
import torch.nn.functional as F
from model.model import build_model
from model.augmentations import get_val_transforms

def test_prediction(image_path, model_path="saved_models/best_model_84.pth"):
    # 1. Load the 70 class names
    json_path = "model/class_names.json"
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found!")
        return
        
    with open(json_path, "r") as f:
        class_names = json.load(f)
        
    num_classes = len(class_names)
    print(f"Loaded {num_classes} classes from JSON.")

    # 2. Load the model
    print(f"Loading model weights from {model_path}...")
    device = torch.device("cpu") # Test locally on Mac CPU
    model = build_model(num_classes=num_classes)
    
    try:
        model.load_state_dict(torch.load(model_path, map_location=device))
    except Exception as e:
        print(f"Failed to load model weights: {e}")
        return
        
    model.to(device)
    model.eval()

    # 3. Load and preprocess the image
    print(f"Processing image: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not read image at {image_path}")
        return
        
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    transforms = get_val_transforms()
    tensor = transforms(image=image)["image"].unsqueeze(0).to(device)

    # 4. Predict
    print("Running AI Inference...")
    with torch.no_grad():
        outputs = model(tensor)
        probabilities = F.softmax(outputs, dim=1)[0]
        
    # 5. Get Top 3 Results
    top3_prob, top3_indices = torch.topk(probabilities, 3)
    
    print("\n" + "="*40)
    print("🧠 AI DIAGNOSIS RESULTS (TOP 3)")
    print("="*40)
    for i in range(3):
        idx = top3_indices[i].item()
        prob = top3_prob[i].item() * 100
        print(f"{i+1}. {class_names[idx]} ({prob:.2f}%)")
    print("="*40 + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_predict.py <path_to_leaf_image.jpg>")
    else:
        test_prediction(sys.argv[1])
