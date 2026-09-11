import os
import json
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from sklearn.model_selection import train_test_split
from tqdm import tqdm
import wandb
from model.model import build_model
from model.dataset import build_dataset, AgriDataset
from model.augmentations import get_train_transforms, get_val_transforms
import torch.nn.functional as F
from sklearn.metrics import f1_score


def set_seed(seed: int = 42):
    """Lock all random seeds for reproducibility (SIH requirement)."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

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
    set_seed(42)  # Lock seeds first before any tensor/data ops
    DATASET_ROOT = "final_dataset/train"
    SAVED_MODELS_DIR = "saved_models"
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    
    print("Building dataset...")
    image_paths, labels, num_classes = build_dataset(DATASET_ROOT)
    
    if num_classes == 0:
        print("Error: No classes found in final_dataset/train!")
        return

    # Train/Val Split (80/20) since we consolidated everything into train for simplicity
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        image_paths, labels, test_size=0.2, stratify=labels, random_state=42
    )

    train_dataset = AgriDataset(train_paths, train_labels, get_train_transforms())
    val_dataset = AgriDataset(val_paths, val_labels, get_val_transforms())

    batch_size = 32 # Hardcoded per protocol to prevent Kaggle Out-Of-Memory
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=True)
    
    # Initialize Weights & Biases (wandb) for tracking
    os.environ["WANDB_MODE"] = "disabled"
    wandb.init(project="agrismart-sih", config={"batch_size": batch_size, "epochs": 15})
    
    device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Using device: {device}")
    
    model = build_model(num_classes=num_classes)
    model.to(device)

    # GradScaler for AMP mixed precision — MUST be defined before training loop
    scaler = torch.cuda.amp.GradScaler(enabled=(device.type == "cuda"))

    epochs = 15     # As requested by user
    criterion = FocalLoss(alpha=0.25, gamma=2.0)
    optimizer = optim.AdamW(model.parameters(), lr=1e-4)
    
    best_f1 = 0.0

    print(f"\n[Training Started] Training on {len(train_paths)} images, Validating on {len(val_paths)} images across {num_classes} classes.")
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        
        loop = tqdm(train_loader, leave=True)
        for images, targets in loop:
            images, targets = images.to(device), targets.to(device)
            
            optimizer.zero_grad()
            with torch.amp.autocast(device_type="cuda", dtype=torch.float16):
                outputs = model(images)
                loss = criterion(outputs, targets)
            scaler.scale(loss).backward()
            
            # Unscale the gradients before clipping to prevent math explosion
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            scaler.step(optimizer)
            scaler.update()
            
            train_loss += loss.item()
            loop.set_description(f"Epoch [{epoch+1}/{epochs}]")
            loop.set_postfix(loss=loss.item())
            
        train_loss /= len(train_loader)
        
        # Validation
        model.eval()
        val_loss = 0.0
        all_preds = []
        all_targets = []
        
        with torch.no_grad():
            for images, targets in val_loader:
                images, targets = images.to(device), targets.to(device)
                outputs = model(images)
                loss = criterion(outputs, targets)
                val_loss += loss.item()
                
                preds = torch.argmax(outputs, dim=1)
                all_preds.extend(preds.cpu().numpy())
                all_targets.extend(targets.cpu().numpy())
                
        val_loss /= len(val_loader)
        macro_f1 = f1_score(all_targets, all_preds, average='macro')
        
        print(f"Epoch {epoch+1} - Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Macro F1: {macro_f1:.4f}")
        wandb.log({"train_loss": train_loss, "val_loss": val_loss, "macro_f1": macro_f1})
        
        if macro_f1 > best_f1:
            best_f1 = macro_f1
            torch.save(model.state_dict(), os.path.join(SAVED_MODELS_DIR, "best_model.pth"))
            print("--> Saved New Best Model!")

if __name__ == "__main__":
    train()
