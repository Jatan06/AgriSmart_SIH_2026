import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
import wandb
from ml_core.model import build_model
import torch.nn.functional as F

# Focal Loss Implementation to handle rare vs common diseases
class FocalLoss(nn.Module):
    def __init__(self, alpha=0.25, gamma=2.0):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma

    def forward(self, inputs, targets):
        ce_loss = F.cross_entropy(inputs, targets, reduction="none")
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1-pt)**self.gamma * ce_loss
        return focal_loss.mean()

def train():
    DATASET_ROOT = "datasets/color"
    SAVED_MODELS_DIR = "saved_models"
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    
    # 1. Dynamically read class names to prevent hardcoding
    if not os.path.exists(DATASET_ROOT):
        print(f"Warning: {DATASET_ROOT} not found. Ensure dataset is downloaded.")
        class_names = []
    else:
        class_names = sorted(os.listdir(DATASET_ROOT))
        class_names = [c for c in class_names if not c.startswith(".")] # Remove .DS_Store
    
    num_classes = len(class_names)
    if num_classes > 0:
        # Write to JSON so predict.py and the FastAPI backend can use it
        os.makedirs("model", exist_ok=True)
        with open("model/class_names.json", "w") as f:
            json.dump(class_names, f)
        print(f"Found {num_classes} classes. Saved to model/class_names.json")
    else:
        print("No classes found. Using dummy 38 classes for code verification.")
        num_classes = 38
        
    # 2. Initialize Weights & Biases (wandb) for tracking
    wandb.init(project="agrismart-sih", config={"batch_size": 16, "epochs": 15})
    
    # 3. Build Model
    # Apple Silicon uses "mps", Nvidia uses "cuda", otherwise "cpu"
    device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Using device: {device}")
    
    model = build_model(num_classes=num_classes)
    model.to(device)
    
    # 4. Training Hyperparameters
    batch_size = 16 # Hardcoded per protocol to prevent Kaggle Out-Of-Memory
    epochs = 15     # As requested by user
    criterion = FocalLoss(alpha=0.25, gamma=2.0)
    optimizer = optim.AdamW(model.parameters(), lr=1e-4)
    
    print("\n[Setup Complete] The training engine is built.")
    print("Waiting for Jatan to finish `dataset.py` so we can connect the DataLoader and start the loops!")

if __name__ == "__main__":
    train()
