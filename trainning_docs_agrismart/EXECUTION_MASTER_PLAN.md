# AgriSmart 5-Day Execution Master Plan

> [!IMPORTANT]
> **The Prime Directive:** We are optimizing for a working, highly accurate prototype over theoretical architecture. Do not build in bulk. Do not hallucinate data. Follow this plan chronologically.

---

## 🛑 AI Builder Protocol (READ BEFORE CODING)

Before generating *any* code for the phases below, the AI must obey this strict protocol:

1. **No Bulk Generation:** Never generate the whole system at once. Build file by file, function by function.
2. **Mandatory Pre-Build Q&A:** If a requirement in this plan is even slightly ambiguous, the AI MUST ask open-ended questions to the user. The AI may not write code until the user has explicitly answered the questions.
3. **No Fake Data:** If an external URL, API key, or dataset path is missing, the AI must ask for it. It cannot invent "dummy.json" endpoints.

---

## Phase 0: The "Crush the Competition" Dataset Strategy (P0)

Every other team will use the basic PlantVillage dataset (lab conditions, clean backgrounds). Their models will fail on real photos. We will use a 3-tier real-world dataset strategy.

### Step 1: Download the Base Knowledge (PlantVillage)

* **Source:** [Kaggle - PlantVillage Dataset](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)
* **Action:** Download and extract to `dataset/plantvillage/`.
* **Purpose:** Teaches the ConvNeXt-V2 model the basic taxonomy of 38 crop diseases.

### Step 2: Download the Real-World Finetuning Data (PlantDoc)

* **Source:** [GitHub - PlantDoc Dataset](https://github.com/pratikkayal/PlantDoc-Dataset) (Or Kaggle PlantDoc mirror)
* **Action:** Download and extract to `dataset/plantdoc/`.
* **Purpose:** 2,500+ images of diseases in *real field conditions* with messy backgrounds. We will finetune the model on this dataset to drastically boost real-world accuracy.

### Step 3: Download the Indian Crop Edge (Rice & Wheat)

* **Source:** [Mendeley Data - Rice Leaf Disease](https://data.mendeley.com/datasets/fwcj7stb8r/1)
* **Action:** Download and extract to `dataset/indian_crops/`.
* **Purpose:** SIH is an Indian hackathon. Perfecting detection on Rice (India's #1 crop) guarantees high judging scores.

### Step 4: Data Consolidation

* **Who:** Ayush.
* **Action:** Write a Python script (`scripts/consolidate_data.py`) to merge these 3 folders into a single `dataset/train/` and `dataset/val/` structure.

---

## Phase 1: ML Core Scaffolding & Training

### 1.1 `augmentations.py`

**Assignee:** Jatan (Isolated Workload)

* **Action:** Implement Albumentations pipelines (`get_train_transforms` and `get_val_transforms`).
* **Details:** Must include `RandomSunFlare` (simulates field glare), `ISONoise` (simulates cheap phone cameras), and `MotionBlur` (simulates shaky farmer hands).

### 1.2 `dataset.py`

**Assignee:** Jatan (Isolated Workload)

* **Action:** Implement a custom PyTorch `Dataset` class.
* **Details:** Must dynamically read folder names to assign class indices. It must never hardcode the number of classes.

### 1.3 `model.py`

**Assignee:** Ayush (Major Workload)

* **Action:** Implement `build_model()`.
* **Details:** Use `timm.create_model('convnextv2_base', pretrained=True)`. *Fallback:* If Kaggle runs out of VRAM, switch to `convnextv2_tiny`.

### 1.4 `train.py`

**Assignee:** Ayush (Major Workload)

* **Action:** Implement the training loop.
* **Critical Specs:**
  * Hardcode `batch_size=16` to prevent Out-Of-Memory (OOM) errors.
  * Use Focal Loss (`alpha=0.25, gamma=2.0`) to handle imbalanced class sizes.
  * Initialize `wandb.init()` for experiment tracking.
  * Dynamically write `class_names.json` to disk during training based on `os.listdir(DATASET_ROOT)`.

### 1.5 `export.py`

**Assignee:** Ayush (Major Workload)

* **Action:** Convert the trained PyTorch model to ONNX.
* **Critical Specs:**
  * You MUST call `model.eval()` before exporting to ONNX.

### 1.6 `predict.py`

**Assignee:** Jatan (Isolated Workload)

*   **Action:** Write a standalone script that runs the ONNX model.
*   **Critical Specs:** 
    *   **Independence:** This script must not import anything from `train.py` or FastAPI. It must run 100% locally from the command line.
    *   **Pathing:** It must use `os.path.dirname(__file__)` to find `class_names.json` and `best_model.onnx` so it doesn't crash regardless of where the judge runs it from.
    *   **Preprocessing:** Must exactly match the normalization values from `augmentations.py`.

---

## Phase 2: FastAPI Backend & AI Agents

**Assignee:** Currently Unassigned (To be delegated after ML is finished)

### 2.1 `inference.py` (ONNX Wrapper)

* **Action:** Write the ONNX session runner.
* **Critical Specs:**
  * Must explicitly define the `softmax()` function using Numpy for numerical stability.
  * Preprocessing (resizing, mean/std normalization) must be byte-for-byte identical to `predict.py`.

### 2.2 `services.py` (External Integrations)

* **Action:** Wire up Open-Meteo and Gemini 1.5 Flash.
* **Weather:** Use `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m&hourly=precipitation_probability`.
* **Gemini:** Pass a strict Pydantic `BaseModel` to `response_schema` to force JSON output.
* **Graceful Fallback (Crucial):** Wrap Gemini in a `try/except`. If it fails, do NOT crash the API. Return a soft warning: `"Agronomist advice temporarily unavailable."`

### 2.3 `main.py` (Routing)

* **Action:** Build the `@app.post("/api/v1/detect")` endpoint.
* **Critical Specs:**
  * Use `lifespan` context manager to load the ONNX model *once* on startup.
  * Inject `CORSMiddleware` specifically allowing `http://localhost:3000` to prevent frontend blocking.

---

## Phase 3: Next.js PWA Frontend

**Assignee:** Currently Unassigned (To be delegated after ML is finished)

### 3.1 PWA Configuration

* **Action:** Configure `next-pwa` in `next.config.mjs`.
* **Purpose:** Ensures the "Add to Home Screen" prompt appears so farmers can install it like a native Android app.

### 3.2 UI Components (Shadcn + Tailwind)

* **Action:** Scaffold the `Dropzone.jsx` and `Dashboard.jsx`.
* **Details:** Must use `aria-labels`. Must be heavily tested on a 375px mobile viewport simulator (Mobile-First design).

### 3.3 State Management & Fetching

* **Action:** Implement `handleAnalyze()` in `page.jsx`.
* **Details:** Must handle loading spinners and explicit error states (using Shadcn Alert). It must send latitude/longitude from the browser's Geolocation API.

---

## Phase 4: Integration & Hard Freeze

### Day 3: The Integration Checkpoint

1. **Frontend meets Backend:** Frontend sends a real image to the FastAPI backend.
2. **Backend meets ML:** FastAPI runs the image through the `.onnx` file generated by Phase 1.
3. **Hard Freeze Rule:** By the end of Day 3, whatever the accuracy of the ONNX model is, we lock it in for the demo. No more ML architectural changes.

### Day 4 & 5: Polish

1. Test CORS and mobile responsiveness.
2. Test the Gemini fallback by turning off Wi-Fi.
3. Record the demo video.
