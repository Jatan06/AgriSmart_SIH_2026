import torch
from ml_core.model import build_model
import os
import json

def export_model():
    print("Loading class names to determine architecture size...")
    class_names_path = "model/class_names.json"
    
    if os.path.exists(class_names_path):
        with open(class_names_path, "r") as f:
            class_names = json.load(f)
        num_classes = len(class_names)
    else:
        print("Warning: class_names.json not found. Using dummy 38 classes.")
        num_classes = 38
        
    print("Initializing model...")
    device = torch.device("cpu") # ONNX export is usually done on CPU for maximum compatibility
    
    model = build_model(num_classes=num_classes)
    
    # Check if a trained weights file exists
    weights_path = "saved_models/best_model.pth"
    if os.path.exists(weights_path):
        print(f"Loading trained weights from {weights_path}...")
        model.load_state_dict(torch.load(weights_path, map_location=device))
    else:
        print(f"Warning: {weights_path} not found. Exporting UNTRAINED weights (dummy) for pipeline testing.")
    
    model.to(device)
    
    # ---------------------------------------------------------
    # CRITICAL SPEC: Call model.eval() before exporting to ONNX
    # ---------------------------------------------------------
    model.eval()
    
    # Create a dummy tensor of the exact input shape (1 image, 3 channels, 224x224)
    dummy_input = torch.randn(1, 3, 224, 224).to(device)
    
    # Define output path
    output_onnx_path = "model/agrismart_model.onnx"
    os.makedirs(os.path.dirname(output_onnx_path), exist_ok=True)
    
    print(f"Exporting model to {output_onnx_path}...")
    torch.onnx.export(
        model,                      # The model to be exported
        dummy_input,                # Model input (or a tuple for multiple inputs)
        output_onnx_path,           # Where to save the model
        export_params=True,         # Store the trained parameter weights inside the model file
        opset_version=14,           # Opset version 14 is highly stable
        do_constant_folding=True,   # Optimize constant folding for faster inference
        input_names=["input"],      # Input tensor names
        output_names=["output"],    # Output tensor names
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}} # Enable variable batch size
    )
    
    print(f"[Success] ONNX Model exported successfully to: {output_onnx_path}")

if __name__ == "__main__":
    export_model()
