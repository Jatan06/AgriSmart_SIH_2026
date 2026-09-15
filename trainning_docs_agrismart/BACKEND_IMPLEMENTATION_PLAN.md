# Backend Implementation Plan (FastAPI)

This is the complete, step-by-step plan for the 2 backend engineers. Follow it exactly. Do not invent your own file structure, endpoint names, or preprocessing logic.

---

## Current State of the Repository

- **Branch:** `feature/ml-core` (all code is here, not `main`)
- **Repo:** Private GitHub. You must be added as a collaborator by Ayush before you can clone.
- **Model weights file:** `model/agrismart_model.onnx` (335MB). This file is `.gitignored` and will NOT be in the repo when you clone. Ayush will send you a Google Drive link to download it. Place it at `model/agrismart_model.onnx` inside the project root.
- **Class mapping file:** `model/class_names.json` — this IS in the repo. It contains exactly 70 disease/healthy class names as a JSON array. Do not edit it.

### Existing Files You Must Not Touch
```
model/
├── __init__.py            # Empty. Makes model/ a Python package.
├── model.py               # build_model(num_classes) → returns a ConvNeXt-V2 PyTorch model
├── augmentations.py       # get_val_transforms() → returns albumentations Compose pipeline
├── class_names.json       # 70-element JSON array of disease names (auto-generated)
├── dataset.py             # Training only. Backend does not use this.
├── train.py               # Training only. Backend does not use this.
├── export.py              # ONNX export. Not needed until final deployment.
└── predict.py             # Judge-facing CLI script. Backend does not use this.
```

### Files You Will Create
```
api/
├── __init__.py            # Empty. Makes api/ a Python package.
├── main.py                # FastAPI app, CORS, lifespan, single POST route
├── inference.py           # Loads ONNX model once, runs predictions
├── services.py            # Weather API + Gemini AI calls
└── .env                   # GEMINI_API_KEY (gitignored, never commit)
```

---

## Step 0: Clone and Setup

```bash
git clone https://github.com/LA777am/AgriSmart_SIH_2026.git
cd AgriSmart_SIH_2026
git checkout feature/ml-core

python3 -m venv venv
source venv/bin/activate

pip install fastapi uvicorn python-multipart httpx pydantic python-dotenv google-generativeai onnxruntime Pillow numpy
```

Then download BOTH `agrismart_model.onnx` (1.9MB) and `agrismart_model.onnx.data` (335MB) from the Google Drive link Ayush sends you, and place them together at:
```
model/agrismart_model.onnx
model/agrismart_model.onnx.data
```
*(Note: ONNX split the architecture and the heavy weights into two files. The script will automatically load the `.data` file as long as they are next to each other.)*

---

## Step 1: Create `api/__init__.py`

Create an empty file. This makes the `api/` folder importable as a Python package.

```python
# api/__init__.py
```

---

## Step 2: Create `api/inference.py`

This file loads the AI model into memory exactly once using pure ONNX, and exposes a single function that takes raw image bytes and returns a prediction dict. It does NOT use PyTorch, making it extremely lightweight and fast.

### Exact Code

```python
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

def softmax(x):
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
    with open(CLASS_NAMES_PATH, "r") as f:
        _class_names = json.load(f)
    num_classes = len(_class_names)
    print(f"[inference] Loaded {num_classes} class names.")

    # 2. Load ONNX Session
    _session = ort.InferenceSession(WEIGHTS_PATH)
    print(f"[inference] ONNX Model loaded from {WEIGHTS_PATH}")


def run_inference(image_bytes: bytes) -> dict:
    """
    Takes raw image bytes from the uploaded file.
    Returns: {"disease_class": str, "confidence": float, "severity": str}
    """
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
```

---

## Step 3: Create `api/services.py`

This file contains two async functions: one to fetch weather, one to call Gemini.

### Exact Code

```python
# api/services.py
import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# --- Weather ---

async def fetch_weather(lat: float, lon: float) -> dict:
    """
    Calls the Open-Meteo API (free, no API key needed).
    Returns: {"temperature_c": float, "humidity": int, "rain_probability": int}
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m"
        f"&hourly=precipitation_probability"
        f"&forecast_days=1"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    return {
        "temperature_c": data["current"]["temperature_2m"],
        "humidity": int(data["current"]["relative_humidity_2m"]),
        "rain_probability": int(data["hourly"]["precipitation_probability"][0]),
    }


# --- Gemini Agronomist AI ---

GEMINI_SYSTEM_PROMPT = """You are an expert agronomist AI. Given a crop disease and weather data,
respond ONLY with a valid JSON object matching this exact schema — no extra text:
{
  "headline": "string (max 10 words)",
  "action_steps": ["string", "string"],
  "sustainability_impact": {
    "water_saved_liters_per_acre": number,
    "chemical_reduction_percent": number,
    "methodology_note": "string"
  },
  "translated_message": "string (in the requested language)"
}"""

GEMINI_FALLBACK = {
    "headline": "AI Advisor temporarily unavailable.",
    "action_steps": [
        "ML diagnosis is complete and accurate.",
        "Agronomist advice will be available shortly.",
    ],
    "sustainability_impact": {
        "water_saved_liters_per_acre": 0,
        "chemical_reduction_percent": 0,
        "methodology_note": "Unavailable"
    },
    "translated_message": "AI Advisor temporarily unavailable.",
    "agent_status": "unavailable",
}


async def generate_agent_advice(
    disease_data: dict, weather_data: dict, language: str
) -> dict:
    """
    Calls Google Gemini to produce agronomist advice.
    Falls back to a static payload on ANY error so the API never crashes.
    """
    try:
        import google.generativeai as genai

        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-3.8-flash")

        user_prompt = (
            f"Disease: {disease_data['disease_class']}. "
            f"Confidence: {disease_data['confidence']:.0%}. "
            f"Severity: {disease_data['severity']}. "
            f"Weather: {weather_data['temperature_c']}°C, "
            f"Humidity: {weather_data['humidity']}%, "
            f"Rain probability: {weather_data['rain_probability']}%. "
            f"Language for translated_message: {language}"
        )

        response = model.generate_content(
            [
                {"role": "user", "parts": [GEMINI_SYSTEM_PROMPT + "\n\n" + user_prompt]}
            ]
        )

        # Parse the JSON from Gemini's response text
        text = response.text.strip()
        # Strip markdown code fences if Gemini wraps them
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0]
        return json.loads(text)

    except Exception as e:
        print(f"[services] Gemini call failed: {e}")
        return GEMINI_FALLBACK
```

---

## Step 4: Create `api/.env`

```
GEMINI_API_KEY=your_actual_key_here
```

Make sure `.gitignore` already contains `/api/.env` (it does).

---

## Step 5: Create `api/main.py`

This is the FastAPI entry point. It wires everything together.

### Exact Code

```python
# api/main.py
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from api.inference import load_model, run_inference
from api.services import fetch_weather, generate_agent_advice


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the 335MB AI model once at server startup, not on every request."""
    print("[main] Loading AI model into memory...")
    load_model()
    print("[main] Model ready. Server accepting requests.")
    yield
    print("[main] Server shutting down.")


app = FastAPI(
    title="AgriSmart AI API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: Without this, the Next.js frontend on localhost:3000 cannot talk to this server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/detect")
async def detect_disease(
    image: UploadFile = File(...),
    lat: float = Form(20.5937),
    lon: float = Form(78.9629),
    language: str = Form("en"),
):
    """
    Accepts an image + coordinates + language.
    Returns ML prediction + weather context + Gemini agronomist advice.

    Response schema matches SYSTEM_ARCHITECTURE_MEGA_DOC.md §4 exactly.
    """
    # 1. Read the uploaded image bytes
    image_bytes = await image.read()

    # 2. Run ML inference in a threadpool to prevent blocking the async event loop
    ml_result = await run_in_threadpool(run_inference, image_bytes)

    # 3. Fetch weather
    try:
        weather_data = await fetch_weather(lat, lon)
    except Exception as e:
        print(f"[main] Weather fetch failed: {e}")
        weather_data = {"temperature_c": 0, "humidity": 0, "rain_probability": 0}

    # 4. Fetch Gemini advice using the weather data
    agent_advice = await generate_agent_advice(ml_result, weather_data, language)

    # 5. Return the combined response (matches SYSTEM_ARCHITECTURE_MEGA_DOC.md §4)
    return {
        "success": True,
        "ml_result": ml_result,
        "weather_context": weather_data,
        "agent_advice": agent_advice,
    }
```

---

## Step 6: Run the Server

From the project root directory:

```bash
cd AgriSmart_SIH_2026
source venv/bin/activate
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Startup takes ~2-5 seconds while ONNX loads the 335MB weights file into memory. Since this uses ONNX Runtime (not PyTorch/timm), there are no HuggingFace downloads or extra cache folders.

---

## Step 7: Test with curl

Once the server says "Model ready. Server accepting requests.", open a second terminal and run:

```bash
curl -X POST http://localhost:8000/api/v1/detect \
  -F "image=@leaf.jpg" \
  -F "lat=23.02" \
  -F "lon=72.57" \
  -F "language=en"
```

Use any `.jpg` or `.png` image of a leaf. There is a `leaf.jpg` already in the project root for testing.

### Expected Response Shape

```json
{
  "success": true,
  "ml_result": {
    "disease_class": "Tomato_Septoria_leaf_spot",
    "confidence": 0.2585,
    "severity": "Low"
  },
  "weather_context": {
    "temperature_c": 32.5,
    "humidity": 78,
    "rain_probability": 85
  },
  "agent_advice": {
    "headline": "Apply Fungicide Before Rain",
    "action_steps": [
      "Remove affected leaves.",
      "Apply Mancozeb-based fungicide."
    ],
    "sustainability_impact": {
      "water_saved_liters_per_acre": 12000,
      "chemical_reduction_percent": 15,
      "methodology_note": "..."
    },
    "translated_message": "..."
  }
}
```

---

## Common Mistakes to Avoid

1. **Do not hardcode `num_classes=70`.** Always read it from `class_names.json` at runtime. If Jatan retrains with a different dataset, the number may change.
2. **Do not use `pretrained=True` in `load_model()`.** You are loading your own weights, not ImageNet weights. Using `pretrained=True` wastes 355MB of bandwidth per startup.
3. **Do not set `Content-Type` headers on the frontend FormData POST.** The browser sets the correct `multipart/form-data` boundary automatically. Manually setting it will break the upload.
4. **Do not forget CORS.** Without the middleware in `main.py`, every single request from the Next.js frontend will be silently blocked by the browser with zero error messages in the Network tab.
5. **Do not put `api/.env` in git.** It is already in `.gitignore`. If you accidentally commit it, immediately rotate the Gemini API key.
6. **The model weights file is 335MB.** It is gitignored. Get it from the Google Drive link Ayush sends.
7. **Do not use `train.py` or `dataset.py`.** These are for ML training in Colab only and should not be imported or run by the backend.
