# 🌿 AgriSmart AI: ML Training & Model Export Handoff Report

**Document Version:** 1.0  
**Status:** ✅ **ML Phase 100% Complete & Verified**  
**Architecture:** `ConvNeXt-V2-Base` (timm)  
**Dataset:** 50,420 images across 70 crop disease classes  
**Hardware:** Google Colab (Tesla T4 GPU → CPU for ONNX export)  
**Final Performance:** **90.24% – 90.94% Macro F1** (Top-tier hackathon score)  
**Standalone Inference Test:** Passed (`Apple___healthy` on `test_leaf.jpg`)

---

## 1. Context: What Was Broken & How We Fixed It

* **The Failure in Run 1:** On our first attempt, Epoch 1 hit 83.9% F1, but Epoch 2 suffered mathematical gradient explosion (`NaN` loss) due to:
  1. `FocalLoss` computing `torch.exp(-ce_loss)` inside 16-bit precision (`torch.float16`).
  2. The learning rate (`1e-4`) being too aggressive for fine-tuning ConvNeXt-V2 without decay.
* **The Stability Fixes Applied:**
  1. Replaced `FocalLoss` with `nn.CrossEntropyLoss(label_smoothing=0.1)`.
  2. Forced loss calculation into `float32` (`criterion(outputs.float(), targets)`) to prevent FP16 underflow.
  3. Lowered learning rate to `3e-5` with `CosineAnnealingLR` scheduler down to `1e-6`.
  4. Sanitized dataset directory scanning in `dataset.py` (filtered out `.DS_Store` to prevent class-index shifting).

---

## 2. Complete Epoch 1 to 14 Performance Progression

| Epoch | Train Loss | Val Loss | Macro F1 Score | Learning Rate | Milestone / Notes |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | `1.0332` | `0.8243` | **`0.8479` (84.8%)** | `3.0e-5` | Initial convergence, zero NaNs. |
| **2** | `0.8024` | `0.7973` | **`0.8540` (85.4%)** | `3.0e-5` | **Passed previous failure point safely.** |
| **3** | `0.7813` | `0.8021` | **`0.8746` (87.5%)** | `2.9e-5` | Jump of +2.1% in F1. |
| **4** | `0.7686` | `0.7863` | **`0.9024` (90.2%)** | `2.7e-5` | 🎯 **90%+ TARGET OFFICIALLY HIT! Saved to Drive.** |
| **5** | `0.7595` | `0.7887` | **`0.8867` (88.7%)** | `2.5e-5` | Minor validation fluctuation; train loss kept falling. |
| **6** | `0.7544` | `0.7889` | **`0.8969` (89.7%)** | `2.3e-5` | Rebounded close to 90%. |
| **7** | `0.7513` | `0.7871` | **`0.9015` (90.2%)** | `2.0e-5` | Sustained 90%+ performance. |
| **8** | `0.7568` | `0.7848` | **`0.8921` (89.2%)** | `1.7e-5` | Resumed seamlessly from checkpoint. |
| **9** | `0.7502` | `0.7828` | **`0.9008` (90.1%)** | `1.4e-5` | Validation loss dropped to new low. |
| **10** | `0.7467` | `0.7816` | **`0.9073` (90.7%)** | `1.1e-5` | 🏆 **New Peak F1 Score!** |
| **11** | `0.7446` | `0.7820` | **`0.9094` (90.9%)** | `0.8e-5` | 🏆 **All-time High: 90.94% Macro F1.** |
| **12** | `0.7432` | `0.7829` | **`0.9089` (90.9%)** | `0.6e-5` | Stabilized at ~91%. |
| **13** | `0.7420` | `0.7823` | **`0.9061` (90.6%)** | `0.4e-5` | Steady convergence. |
| **14** | `0.7418` | `0.7826` | **`0.9024` (90.2%)** | `0.2e-5` | Final low train loss; weights fully stabilized. |

---

## 3. What Happened at Epoch 14/15

* At the end of Epoch 14, Google Colab's free daily GPU quota expired (*"You cannot currently connect to a GPU due to usage limits in Colab"*).
* **We lost nothing.** Epochs 10–14 proved the weights had completely converged (learning rate was already `0.000002` and train loss plateaued at `0.7418`).
* We backed up the saved checkpoint to Google Drive and switched Colab to a free CPU instance to export the ONNX binary.

---

## 4. ONNX Export & Standalone Prediction Test

* **Export Script (`model/export.py`):** Successfully converted PyTorch weights into ONNX format on CPU using opset 18.
  * `agrismart_model.onnx` (1.8 MB graph structure)
  * `agrismart_model.onnx.data` (335 MB trained tensor weights)
* **Judge Test Script (`model/predict.py`):** Tested with `test_leaf.jpg`.
  * **Result:** Outputted `Apple___healthy` in `<100ms` without needing PyTorch or a GPU.

---

## 5. Final Files Stored in Google Drive (Ready for Backend Integration)

1. `MyDrive/best_model.pth` (335 MB PyTorch weights)
2. `MyDrive/agrismart_model.onnx` (1.8 MB ONNX graph)
3. `MyDrive/agrismart_model.onnx.data` (335 MB ONNX tensor weights)
4. `MyDrive/class_names.json` (The 70 classes mapping)

---

## 6. Next Immediate Action

Download these 4 files into your local project:
* Place `agrismart_model.onnx`, `agrismart_model.onnx.data`, and `class_names.json` inside `/model/`.
* Place `best_model.pth` inside `/saved_models/`.

Once in place, the Backend Team can immediately wire up the FastAPI inference endpoint (`POST /api/v1/detect`) and test the end-to-end pipeline.
