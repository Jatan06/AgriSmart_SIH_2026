# 🚀 AgriSmart Kaggle ML Runbook

Hey there! If you are reading this, you are the designated ML Engineer taking over the training pipeline on Kaggle. Ayush and the AI have set up the core infrastructure, but the model needs your expertise to stop the loss from exploding and to push the Macro F1 score past 90%.

Here is exactly what you need to do, step-by-step.

---

## 1. What Files Do You Need to Put into Kaggle?

You need to upload two things to a new Kaggle Notebook:

**A. The Dataset (Upload as a Kaggle Dataset):**
*   Upload the entire `final_dataset/` folder containing the 50,000+ images. 
*   *Tip:* Zip the folder first, upload it to Kaggle Datasets, and then attach that dataset to your Kaggle Notebook.

**B. The Python Code (Upload into the Notebook's Working Directory):**
Upload the entire `model/` folder from the GitHub repository into your Kaggle `/kaggle/working/` directory. You specifically need:
*   `dataset.py`
*   `augmentations.py`
*   `model.py`
*   `train.py`
*   `export.py`

*(You also need to run `!pip install albumentations timm onnx onnxruntime wandb` in your first notebook cell).*

---

## 2. What Exactly Should You Try & Fix?

Currently, the model is using **ConvNeXt-V2 Base**. It is extremely powerful—in our tests, it hit 83.9% Macro F1 on just the first epoch! However, by Epoch 2 or 3, the gradients explode and the loss turns into `NaN`. 

Your goal is to stabilize the training for 15 epochs. **Open `train.py` and experiment with the following:**

1.  **Lower the Learning Rate (Priority 1):**
    *   Currently, `lr=1e-4`. This is too high for a pre-trained ConvNeXt. 
    *   **Try:** `lr=1e-5` or `lr=5e-5`.
2.  **Swap the Loss Function (Priority 2):**
    *   Currently, we use a custom `FocalLoss` to handle class imbalances. However, `FocalLoss` can be mathematically unstable in PyTorch `float16` AMP.
    *   **Try:** Comment out `FocalLoss` and switch to standard `nn.CrossEntropyLoss()`.
3.  **Adjust the Batch Size:**
    *   ConvNeXt-V2 is massive. If you get a CUDA Out of Memory (OOM) error, drop the `batch_size` in `train.py` from `32` down to `16`.
4.  **Swap the Architecture (Last Resort):**
    *   If you cannot stabilize ConvNeXt-V2, open `model.py` and swap the `timm.create_model` string to something lighter but highly accurate, like `'efficientnet_b4'` or `'resnet50'`.

---

## 3. How to Retry and Iterate?

1.  Make a change to the hyperparameters in `train.py` directly in the Kaggle file editor (or upload a new version).
2.  Run the training command in a notebook cell:
    ```bash
    !python model/train.py --dataset_dir /kaggle/input/your-dataset-name/final_dataset/train
    ```
3.  Watch the Epoch 1, 2, and 3 logs. If the loss turns to `NaN`, instantly stop the cell, change the learning rate or loss function, and run it again.

---

## 4. When Are You Done? (What to Give Back to the AI)

You are done when you successfully train a model for **15 Epochs** without `NaN` loss, and the **Validation Macro F1 Score is > 90%**.

Once you achieve this, you need to run the ONNX export script inside Kaggle to convert the PyTorch model into a format the FastAPI backend can read:

```bash
# This converts best_model.pth into ONNX format
!python model/export.py 
```

### The 3 Files You Must Give Back to Ayush & The AI:
Download these exact 3 files from your Kaggle output directory and send them back to Ayush:

1.  `agrismart_model.onnx` *(The model architecture graph - ~2MB)*
2.  `agrismart_model.onnx.data` *(The massive model weights file - ~300MB)*
3.  `class_names.json` *(Crucial: This maps the model's output array indices back to the exact string names of the 70 diseases. The backend will crash without this).*

Once Ayush uploads these three files back into our workspace, the AI will hot-swap them into the FastAPI backend, and the integration will be 100% complete!
