# ML Handoff: Model Optimization & Training

Jatan, you are taking over the ML pipeline. We hit an 83.9% Macro F1 on Epoch 1 using `ConvNeXt-V2 Base`, but the gradients mathematically exploded to `NaN` in Epoch 2 due to the learning rate being too high for 16-bit precision. 

Your job is to stabilize the training script, hunt for 90%+ accuracy over a full 15 epochs, and give us the final model weights so we can plug them into the FastAPI backend.

## 1. Setup Your Google Colab Environment
Do not run this locally. Use Google Colab with a T4 GPU.

1. Ask Ayush for the Google Drive share link for `SIH_2026.zip` (This contains the code and the full merged 4GB dataset).
2. Save that ZIP file to the root of your own Google Drive.
3. Open a new Colab notebook, and set hardware to T4 GPU.
4. Mount your Google Drive and extract the files by running these exact cells:

```python
from google.colab import drive
drive.mount('/content/drive')
```
```bash
!unzip -q /content/drive/MyDrive/SIH_2026.zip -d /content/
```

## 2. Re-generate the Class Mapping
Because Colab deletes files when VMs shut down, we lost the generated JSON array of the 70 classes. Re-generate it by running this cell so your model maps the classes correctly:

```python
import os, json
class_names = sorted(os.listdir('/content/SIH_2026/final_dataset/train'))
with open('/content/SIH_2026/model/class_names.json', 'w') as f:
    json.dump(class_names, f, indent=2)
```

## 3. The Objective: Fix `train.py`
Open `/content/SIH_2026/model/train.py` inside Colab's left file explorer. You need to tweak the hyperparameters so the math survives 15 epochs without exploding.

Try these specific changes:
1. **Lower the Learning Rate:** Change `optim.AdamW(model.parameters(), lr=1e-4)` to `lr=1e-5` or `lr=5e-5`.
2. **Change the Loss Function:** Our custom `FocalLoss` is mathematically unstable in PyTorch `float16`. Replace it with standard `nn.CrossEntropyLoss()`.
3. **Change Architecture:** If ConvNeXt-V2 keeps throwing `NaN` losses, open `model/model.py` and swap it for a standard, stable model like `resnet50`.

## 4. Run the Training
Once you've tweaked `train.py`, run the training loop. The script is designed to automatically save the weights of the highest-scoring epoch into the `saved_models` folder.

```bash
!cd /content/SIH_2026 && pip install -r requirements.txt
!cd /content/SIH_2026 && python -m model.train
```

## 5. What to Hand Back
When you secure a model that successfully hits 90%+ F1 score across the full run, send us these two exact files so we can serve them in the API:
1. `/content/SIH_2026/saved_models/best_model.pth`
2. `/content/SIH_2026/model/class_names.json`
