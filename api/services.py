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
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)

    except Exception as e:
        print(f"[services] Gemini call failed: {e}")
        return GEMINI_FALLBACK
