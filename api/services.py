# api/services.py
import os
import json
import httpx
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"), override=True)

# --- Weather ---

def calculate_safe_window(hourly_times, hourly_probs):
    """
    Scans the forecast horizon (e.g. 72 hours). Finds a contiguous block of at least 2 hours where rain prob < 30%.
    """
    if not hourly_times:
        return None
        
    now = datetime.fromisoformat(hourly_times[0])
    
    for i in range(len(hourly_probs) - 1):
        if hourly_probs[i] < 30 and hourly_probs[i+1] < 30:
            start_dt = datetime.fromisoformat(hourly_times[i])
            end_dt = datetime.fromisoformat(hourly_times[i+1]) + timedelta(hours=1)
            duration_mins = int((end_dt - start_dt).total_seconds() / 60)
            
            if start_dt.date() == now.date():
                start_str = start_dt.strftime("%H:%M")
                end_str = end_dt.strftime("%H:%M")
            elif start_dt.date() == now.date() + timedelta(days=1):
                start_str = start_dt.strftime("Tomorrow, %H:%M")
                end_str = end_dt.strftime("%H:%M")
            else:
                start_str = start_dt.strftime("%b %d, %H:%M")
                end_str = end_dt.strftime("%b %d, %H:%M")
                
            return {
                "start_time": start_str,
                "end_time": end_str,
                "duration_mins": duration_mins
            }
    return None

async def fetch_weather(lat: float, lon: float) -> dict:
    """
    Calls the Open-Meteo API. Returns current weather + 12-hour forecast + safe window.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,uv_index"
        f"&hourly=precipitation_probability"
        f"&forecast_hours=72"
        f"&timezone=auto"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    current = data["current"]
    hourly = data["hourly"]
    
    # Extract the next 6 hours for the UI timeline
    six_hour_forecast = [
        {
            "time": hourly["time"][i],
            "rain_prob": hourly["precipitation_probability"][i]
        }
        for i in range(6)
    ]

    safe_window = calculate_safe_window(hourly["time"], hourly["precipitation_probability"])

    return {
        "temperature_c": current.get("temperature_2m", 27),
        "humidity": current.get("relative_humidity_2m", 93),
        "rain_probability": current.get("precipitation_probability", 0),
        "wind_speed": current.get("wind_speed_10m", 0),
        "uv_index": current.get("uv_index", 3),
        "hourly_forecast": six_hour_forecast,
        "safe_window": safe_window
    }


# --- Gemini Agronomist AI ---

GEMINI_SYSTEM_PROMPT = """You are an expert agronomist AI. Given a crop disease and weather data,
respond ONLY with a valid JSON object matching this exact schema — no extra text:
{
  "action_plan": {
    "en": [
      {"id": "01", "action": "string (1-2 words uppercase)", "desc": "string (sentence)", "status": "string (e.g. '✓ NOW', '◷ WAIT', '→ NEXT')"},
      {"id": "02", "action": "string", "desc": "string", "status": "string"},
      {"id": "03", "action": "string", "desc": "string", "status": "string"}
    ],
    "gu": [
      {"id": "01", "action": "string (Gujarati)", "desc": "string (Gujarati)", "status": "string (Gujarati equivalent of '✓ NOW' etc)"},
      {"id": "02", "action": "string", "desc": "string", "status": "string"},
      {"id": "03", "action": "string", "desc": "string", "status": "string"}
    ]
  },
  "sustainability_impact": {
    "water_saved_liters_per_acre": number,
    "chemical_reduction_percent": number,
    "methodology_note": "string"
  }
}
CRITICAL: You MUST provide EXACTLY 3 steps in both 'en' and 'gu' arrays."""

def get_gemini_fallback(disease_class: str) -> dict:
    disease_name = disease_class.split("___")[-1].replace("_", " ") if "___" in disease_class else disease_class
    
    if "healthy" in disease_name.lower():
        return {
            "action_plan": {
                "en": [
                    {"id": "01", "action": "MAINTAIN", "desc": "Continue current watering and nutrition schedule.", "status": "✓ NOW"},
                    {"id": "02", "action": "MONITOR", "desc": "Check leaves weekly for any signs of spots or yellowing.", "status": "◷ ONGOING"},
                    {"id": "03", "action": "PREVENT", "desc": "Ensure proper spacing for air circulation.", "status": "→ NEXT"}
                ],
                "gu": [
                    {"id": "01", "action": "જાળવી રાખો", "desc": "વર્તમાન પાણી અને પોષણ શેડ્યૂલ ચાલુ રાખો.", "status": "✓ હમણાં"},
                    {"id": "02", "action": "નિરીક્ષણ કરો", "desc": "કોઈપણ ફોલ્લીઓ અથવા પીળા પડવાના ચિહ્નો માટે સાપ્તાહિક પાંદડા તપાસો.", "status": "◷ ચાલુ"},
                    {"id": "03", "action": "અટકાવો", "desc": "હવાના પરિભ્રમણ માટે યોગ્ય જગ્યા સુનિશ્ચિત કરો.", "status": "→ આગળ"}
                ]
            },
            "sustainability_impact": {
                "water_saved_liters_per_acre": 0,
                "chemical_reduction_percent": 100,
                "methodology_note": "Crop is healthy. No chemical treatment required."
            }
        }
        
    return {
        "action_plan": {
            "en": [
                {"id": "01", "action": "REMOVE", "desc": f"Remove visibly infected leaves showing signs of {disease_name}.", "status": "✓ NOW"},
                {"id": "02", "action": "WAIT", "desc": "Allow the expected rain window to pass to prevent chemical runoff.", "status": "◷ WAIT"},
                {"id": "03", "action": "TREAT", "desc": f"Apply a targeted copper-based fungicide or organic neem oil to treat {disease_name}.", "status": "→ NEXT"}
            ],
            "gu": [
                {"id": "01", "action": "દૂર કરો", "desc": f"ચેપગ્રસ્ત પાંદડા દૂર કરો જે {disease_name} ના ચિહ્નો દર્શાવે છે.", "status": "✓ હમણાં"},
                {"id": "02", "action": "રાહ જુઓ", "desc": "રાસાયણિક પ્રવાહને રોકવા માટે વરસાદની બારી પસાર થવા દો.", "status": "◷ રાહ જુઓ"},
                {"id": "03", "action": "સારવાર", "desc": f"{disease_name} ની સારવાર માટે ફૂગનાશક અથવા લીમડાના તેલનો ઉપયોગ કરો.", "status": "→ આગળ"}
            ]
        },
        "sustainability_impact": {
            "water_saved_liters_per_acre": 250,
            "chemical_reduction_percent": 15,
            "methodology_note": "Based on standard localized spraying guidelines without LLM optimization."
        }
    }


async def generate_agent_advice(
    disease_data: dict, weather_data: dict, language: str
) -> dict:
    """
    Calls Groq LLM to produce agronomist advice in both English and Gujarati.
    Falls back to a static payload on ANY error.
    """
    try:
        from groq import Groq

        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        user_prompt = (
            f"Disease: {disease_data['disease_class']}. "
            f"Confidence: {disease_data['confidence']:.0%}. "
            f"Severity: {disease_data['severity']}. "
            f"Weather: {weather_data['temperature_c']}°C, "
            f"Humidity: {weather_data['humidity']}%, "
            f"Rain probability: {weather_data['rain_probability']}%. "
            f"Create a 3-step action plan tailored to this specific disease and the current weather constraints. "
            f"Crucially, in the treatment step, you MUST specify the exact chemical (e.g., Copper Fungicide, Chlorothalonil) or organic treatment to use."
        )

        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {"role": "system", "content": GEMINI_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=800,
        )

        text = response.choices[0].message.content.strip()
        
        # Robustly extract JSON block in case the model outputs conversational text
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            json_str = text[start_idx:end_idx+1]
        else:
            json_str = text
            
        return json.loads(json_str)

    except Exception as e:
        print(f"[services] Groq call failed: {e}")
        return get_gemini_fallback(disease_data.get('disease_class', 'the disease'))

async def generate_chat_response(messages: list, context: dict = None) -> str:
    """
    Calls Groq LLM with conversation history for the chatbot, injecting live analysis context.
    """
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        system_prompt = "You are an expert AgriSmart Agronomist. Provide concise, scientific, and practical farming advice. Keep responses brief and helpful."
        
        if context:
            ml = context.get('ml_result', {})
            weather = context.get('weather_context', {})
            plan = context.get('agent_advice', {}).get('action_plan', {}).get('en', [])
            
            system_prompt += (
                f"\n\nCURRENT FIELD CONTEXT (You have access to this real-time data):\n"
                f"- Diagnosis: {ml.get('disease_class', 'Unknown')} ({ml.get('confidence', 0)*100:.1f}% confidence)\n"
                f"- Weather: {weather.get('temperature_c', '?')}°C, {weather.get('humidity', '?')}% humidity, "
                f"{weather.get('rain_probability', '?')}% current rain probability.\n"
                f"- 6-Hour Rain Forecast: {[h.get('rain_prob') for h in weather.get('hourly_forecast', [])]}%\n"
                f"- Treatment Action Plan: {json.dumps(plan)}"
            )

        # Convert frontend messages format to Groq format
        formatted_messages = [
            {"role": "system", "content": system_prompt}
        ]
        for msg in messages:
            role = "assistant" if msg["role"] == "assistant" else "user"
            formatted_messages.append({"role": role, "content": msg["content"]})
            
        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=formatted_messages,
            temperature=0.5,
            max_tokens=512,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[services] Groq chat call failed: {e}")
        return "I'm your AI Agronomist! I can help you analyze crop diseases and recommend treatments. Please use the 'Analyze' section above to upload a photo of your leaf, and I'll give you a detailed action plan!"
