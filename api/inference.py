# api/inference.py
import os
import json
import io
import numpy as np
from PIL import Image
import onnxruntime as ort

# Resolve paths relative to the project root (one level up from api/)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLASS_NAMES_PATH = os.path.join(PROJECT_ROOT, "model", "class_names.json")
WEIGHTS_PATH = os.path.join(PROJECT_ROOT, "model", "agrismart_model.onnx")

# These are set once at startup via load_model(), then reused for every request
_session = None
_class_names = None


def softmax(x: np.ndarray) -> np.ndarray:
    """Numerically stable softmax for NumPy."""
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / e_x.sum(axis=-1, keepdims=True)


def load_model():
    """
    Called exactly once during FastAPI lifespan startup.
    Loads the ONNX model into memory so inference is instantaneous.
    """
    global _session, _class_names

    # 1. Load class names
    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        _class_names = json.load(f)
    num_classes = len(_class_names)
    print(f"[inference] Loaded {num_classes} class names.")

    # 2. Load ONNX Session with optimized options to prevent CPU overheating
    opts = ort.SessionOptions()
    opts.intra_op_num_threads = 1
    opts.inter_op_num_threads = 1
    
    _session = ort.InferenceSession(WEIGHTS_PATH, sess_options=opts)
    print(f"[inference] ONNX Model loaded from {WEIGHTS_PATH} (Optimized for low CPU)")


def run_inference(image_bytes: bytes) -> dict:
    """
    Takes raw image bytes from the uploaded file.
    Returns: {"disease_class": str, "confidence": float, "severity": str}
    """
    if _session is None or _class_names is None:
        raise RuntimeError("Model is not loaded. Call load_model() before run_inference().")

    # 1. Open image from bytes, convert to RGB, and resize to 224x224
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))

    # 2. Normalize to [0, 1] range
    img_array = np.array(image, dtype=np.float32) / 255.0

    # 3. Apply ImageNet Mean & Std Normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_array = (img_array - mean) / std

    # 4. Transpose from (H, W, C) to (C, H, W)
    img_array = img_array.transpose(2, 0, 1)

    # 5. Add batch dimension -> (1, C, H, W)
    img_array = np.expand_dims(img_array, axis=0)

    # 6. Run ONNX Inference
    outputs = _session.run(["output"], {"input": img_array})[0]

    # 7. Post-process logits to probabilities
    probabilities = softmax(outputs)[0]

    confidence = float(probabilities.max())
    class_idx = int(probabilities.argmax())
    disease_class = _class_names[class_idx]

    # Severity thresholds (from SYSTEM_ARCHITECTURE_MEGA_DOC.md §6)
    if confidence > 0.85:
        severity = "High"
    elif confidence > 0.60:
        severity = "Medium"
    else:
        severity = "Low"

    return {
        "disease_class": disease_class,
        "confidence": confidence,
        "severity": severity,
    }
