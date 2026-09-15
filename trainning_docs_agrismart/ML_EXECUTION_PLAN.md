# ML-Only Execution Master Plan: Ayush & Jatan

> [!IMPORTANT]
> **The Prime Directive:** This plan covers the Machine Learning phase ONLY. No frontend or backend work is permitted until this plan is 100% complete and the `.onnx` file is successfully exported.

---

## 🛑 Mandatory AI Builder Protocol (READ BEFORE CODING)
Before generating *any* code for the files below, both Ayush's AI and Jatan's AI MUST obey this strict protocol to prevent hallucination:
1.  **No Bulk Generation:** Never generate the whole system at once. Build one single file at a time.
2.  **Mandatory Pre-Build Q&A:** Before writing any code for a specific file, the AI MUST ask open-ended questions to clarify any ambiguities about paths, parameters, or dataset structures. **The AI may not output code until the user answers these questions.**
3.  **Strict Boundary Adherence:** Ayush's AI must never write `dataset.py`. Jatan's AI must never write `model.py`. Do not cross boundaries.
4.  **No Fake Data:** Do not invent "dummy paths" or fake APIs. If a variable is unknown, pause and ask the user.

---

## 🚀 What You Can Both Start Building Right Now

You do not need to wait for each other. You can both start coding your assigned files immediately using dummy tensor shapes.

*   **Ayush Can Start:** Building `model.py`. You do not need the real dataset to build the ConvNeXt-V2 architecture. You can test it locally by passing a random `(16, 3, 224, 224)` tensor through it to ensure it compiles.
*   **Jatan Can Start:** Building `augmentations.py`. You do not need the model or the images to write the Albumentations pipelines. You can write the functions and test them on a single random image from Google.

---

## 👨‍💻 AYUSH'S BLUEPRINT: The ML Core
**Focus:** Neural Network Architecture, Loss Functions, Training Loop, and Deployment Export.

### 1. `model.py` (Architecture)
*   **Action:** Build the `build_model(num_classes)` function.
*   **Strict Rule:** Use `timm.create_model('convnextv2_base', pretrained=True)`. Do not use ResNet or ViT.
*   **Fallback:** If Kaggle/Colab runs out of GPU memory during testing, switch to `convnextv2_tiny`.

### 2. `train.py` (The Engine)
*   **Action:** Write the training and validation loops.
*   **Critical Specs:**
    *   **Memory Limit:** Hardcode `batch_size=16`. Do not exceed this or Kaggle will crash.
    *   **Loss Function:** Must use `Focal Loss` (alpha=0.25, gamma=2.0). Do not use standard CrossEntropy.
    *   **Tracking:** Initialize `wandb` to log `loss` and `macro_f1`.
    *   **Dynamic JSON Mapping:** At the start of the script, `train.py` MUST scan the `dataset/train/` folder names and write them to `model/class_names.json`. Never hardcode the class names list in python.
    *   **Dependencies:** Import `build_dataset` from Jatan's `dataset.py` file.

### 3. `export.py` (The Bridge)
*   **Action:** Convert the `.pth` weights to a `.onnx` binary.
*   **Critical Specs:**
    *   You MUST call `model.eval()` before calling `torch.onnx.export()`. If you miss this, BatchNorm runs in training mode and predictions will be garbage.

---

## 👨‍💻 JATAN'S BLUEPRINT: Data & Inference
**Focus:** Data Pipelines, Augmentations, and the Final Evaluation Script.

### 1. `augmentations.py` (Real-World Robustness)
*   **Action:** Write `get_train_transforms()` and `get_val_transforms()`.
*   **Critical Specs:**
    *   **Base:** Resize to `224x224`, Normalize to ImageNet `[0.485, 0.456, 0.406]`.
    *   **Real-World Sims:** Add `A.RandomSunFlare` (field glare), `A.ISONoise` (cheap phone cameras), and `A.MotionBlur` (shaky hands).

### 2. `dataset.py` (The DataLoader)
*   **Action:** Build the custom PyTorch `Dataset` class and `build_dataset()` function.
*   **Critical Specs:**
    *   **No Hardcoding:** The class must use `os.listdir()` to read folder names and assign them integer IDs. If there are 38 folders, it handles 38 classes. If 40 folders, it handles 40 classes.
    *   **Dependencies:** Apply the transforms from `augmentations.py` before returning the tensor.

### 3. `predict.py` (The Judges' Test Script)
*   **Action:** Write a standalone script that runs the ONNX model.
*   **Critical Specs:**
    *   **Independence:** This script must not import anything from `train.py` or FastAPI. It must run 100% locally from the command line.
    *   **Pathing:** It must use `os.path.dirname(__file__)` to find `class_names.json` and `best_model.onnx` so it doesn't crash regardless of where the judge runs it from.
    *   **Preprocessing:** Must exactly match the normalization values from `augmentations.py`.

---

## 🔗 The Integration Point (When You Finally Collaborate)
1.  **Jatan** finishes `dataset.py` and pushes to git.
2.  **Ayush** pulls the git branch, imports Jatan's `dataset.py` into `train.py`, and begins training.
3.  **Ayush** finishes training and exports `best_model.onnx`.
4.  **Ayush** gives `best_model.onnx` to **Jatan**.
5.  **Jatan** tests the ONNX file using `predict.py`.

## User Review Required
Does this ML-Exclusive plan give you and Jatan the absolute clarity you need to start coding in parallel right now without hallucinating or stepping on each other's toes?
