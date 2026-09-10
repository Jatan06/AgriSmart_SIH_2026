import torch
import torch.nn as nn
import timm

def build_model(num_classes: int, model_name: str = "convnextv2_base", pretrained: bool = True):
    """
    Builds the ConvNeXt-V2 architecture for plant disease classification.
    """
    print(f"Building {model_name} with {num_classes} classes...")
    
    # Create the model using timm
    # num_classes replaces the final classification head automatically
    model = timm.create_model(model_name, pretrained=pretrained, num_classes=num_classes)
    
    return model

if __name__ == "__main__":
    # Local Testing using dummy tensors
    dummy_num_classes = 38
    print("Testing model compilation with dummy tensor...")
    
    try:
        model = build_model(num_classes=dummy_num_classes)
        
        # Create a dummy tensor representing a batch of 16 RGB images (224x224)
        dummy_input = torch.randn(16, 3, 224, 224)
        
        # Pass the dummy tensor through the model
        outputs = model(dummy_input)
        
        # Check if the output shape is correct: [batch_size, num_classes] -> [16, 38]
        assert outputs.shape == (16, dummy_num_classes), f"Expected shape (16, {dummy_num_classes}), got {outputs.shape}"
        
        print("Success! Model compiled perfectly. Output shape is:", outputs.shape)
        
    except Exception as e:
        print(f"Error during model compilation: {e}")
