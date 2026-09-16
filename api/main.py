# api/main.py
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from pydantic import BaseModel
from typing import List, Dict, Optional

from api.inference import load_model, run_inference
from api.services import fetch_weather, generate_agent_advice, generate_chat_response

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    context: Optional[dict] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ONNX AI model once at server startup, not on every request."""
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

# CORS: Allow requests from localhost, Render frontend, and any domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3001",
        "https://agrismart-sih-2026.onrender.com",
    ],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": "AgriSmart AI API", "version": "1.0.0"}


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


@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Handles conversational interactions with the Agronomist AI.
    Expects a list of messages with 'role' (user/assistant) and 'content', plus an optional context dictionary.
    """
    response_text = await generate_chat_response(request.messages, request.context)
    return {"response": response_text}
