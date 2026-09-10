import albumentations as A
from albumentations.pytorch import ToTensorV2


def get_train_transforms() -> A.Compose:
    """
    Returns the augmentation pipeline for training data.

    Simulates real-world field degradation to make the model robust
    to conditions a farmer's phone camera actually encounters.
    Order matters — normalisation and ToTensorV2 must be last.
    """
    return A.Compose([
        A.RandomResizedCrop(size=(224,224), scale=(0.8, 1.0)),
        A.HorizontalFlip(p=0.5),
        A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, p=0.5),
        A.MotionBlur(blur_limit=3, p=0.2),                       # Simulates shaky farmer hands
        A.ISONoise(p=0.2),                                        # Simulates cheap phone cameras
        A.RandomSunFlare(flare_roi=(0, 0, 1, 0.5), p=0.1),      # Simulates field glare
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])


def get_val_transforms() -> A.Compose:
    """
    Returns the augmentation pipeline for validation data.

    Deterministic preprocessing only — no random distortions.
    Resize → CenterCrop → Normalize → Tensor, in that exact order.
    """
    return A.Compose([
        A.Resize(height=256, width=256),
        A.CenterCrop(height=224, width=224),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])