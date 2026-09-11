"""
predict.py — Standalone Judge Evaluation Script

RULES (DO NOT VIOLATE):
1. This script imports NOTHING from train.py, model.py, or any FastAPI file.
2. All paths use os.path.dirname(__file__) so it works regardless of
   which directory the judge runs it from.
3. The only output is the disease class string via print() — zero extra text.
4. Preprocessing is byte-for-byte identical to inference.py in the backend.
   Any divergence between these two files = different predictions = demo failure.

Usage:
    python predict.py --image path/to/leaf.jpg
"""

import os
import json
import argparse
import numpy as np
import onnxruntime
from PIL import Image

# Resolve all paths relative to this file's location (model/).
# This guarantees the script works no matter where the judge invokes it from.
_MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
_CLASS_NAMES_PATH = os.path.join(_MODEL_DIR, "class_names.json")
_ONNX_MODEL_PATH = os.path.join(_MODEL_DIR, "agrismart_model.onnx")


def preprocess_image(image_path: str) -> np.ndarray:
    """
    Converts a raw image file into an ONNX-ready float32 tensor.

    CRITICAL: This function must remain byte-for-byte identical to the
    preprocessing block in api/inference.py. Both files normalise with
    the same ImageNet mean/std. Changing one without changing the other
    will silently corrupt predictions.

    Args:
        image_path: Absolute or relative path to the input image.

    Returns:
        A float32 numpy array of shape (1, 3, 224, 224).
    """
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

    img  = np.array(Image.open(image_path).convert("RGB").resize((224, 224))) / 255.0
    img  = (img - mean) / std
    img  = img.transpose(2, 0, 1)    # HWC → CHW: (224, 224, 3) → (3, 224, 224)
    img  = np.expand_dims(img, 0)    # Add batch dim: (3, 224, 224) → (1, 3, 224, 224)
    img  = img.astype(np.float32)

    return img


def predict(image_path: str) -> str:
    """
    Top-level callable Python API required by SIH PDF Section 4.1.

    This function can be imported and called directly by automated evaluation
    scripts:
        from model.predict import predict
        label = predict("path/to/leaf.jpg")

    Args:
        image_path: Absolute or relative path to the input image.

    Returns:
        The predicted disease class name string (e.g. 'Tomato_Early_blight').
    """
    class_names = json.load(open(_CLASS_NAMES_PATH))
    session = onnxruntime.InferenceSession(_ONNX_MODEL_PATH)
    tensor = preprocess_image(image_path)
    outputs = session.run(["output"], {"input": tensor})[0]
    predicted_idx = int(np.argmax(outputs[0]))
    return class_names[predicted_idx]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="AgriSmart AI — standalone crop disease predictor."
    )
    parser.add_argument(
        "--image",
        type=str,
        required=True,
        help="Path to the leaf image file (JPEG or PNG).",
    )
    args = parser.parse_args()

    print(predict(args.image))
