# Detailed Agentic Workflow & Weather Intelligence (Team Brute Force)
*(SIH 2026 - Comprehensive Breakdown of Bonus Modules C, E, and G)*

While the core machine learning model (ConvNeXt-V2) excels at diagnosing the disease, AgriSmart AI sets itself apart by employing a fully autonomous, multi-step **Agentic Workflow**. This backend pipeline acts as a digital agronomist, synthesizing the visual diagnosis with live environmental data to produce actionable, hyper-localized advice.

---

## 1. The Autonomous 5-Step Pipeline (Deep Dive)

When a farmer uploads an image, the FastAPI backend orchestrates a complex, non-blocking asynchronous pipeline:

### Step 1: Vision Inference (`api/inference.py`)
- **Action:** The raw image bytes are received, converted to RGB, and resized to a 224x224 tensor.
- **Normalization:** ImageNet mean (`[0.485, 0.456, 0.406]`) and standard deviation are applied.
- **Inference:** The CPU-optimized ONNX model executes the forward pass.
- **Output:** A softmax distribution yields the highest confidence class (e.g., `Tomato___Early_blight` at 92.4% confidence).

### Step 2: Live Weather Retrieval (`api/services.py`)
- **Action:** Before making any recommendations, the system must understand the environment.
- **Execution:** An `httpx.AsyncClient` makes a non-blocking request to the **Open-Meteo API** using the farmer's exact latitude and longitude.
- **Data Fetched:** Current temperature, relative humidity, 10m wind speed, UV index, and a critical 72-hour hourly precipitation probability matrix.

### Step 3: Deterministic Safe-Window Calculation (Bonus C)
- **Action:** We do not rely on LLMs to do math. A deterministic Python algorithm (`calculate_safe_window()`) parses the 72-hour weather forecast.
- **Execution:** It scans for a contiguous 2-hour block where the `precipitation_probability` is strictly `< 30%`.
- **Output:** It calculates the exact local time (e.g., "Tomorrow, 14:00") and duration for a safe chemical spraying window, preventing environmental runoff.

### Step 4: LLM Synthesis & Prompt Injection (Groq API)
- **Action:** The system dynamically constructs a highly constrained system prompt.
- **Context Injected:** It feeds the Groq/Qwen 27B model the disease name, confidence score, exact temperature, humidity, rain probability, and the safe spraying window.
- **Constraint:** The model is strictly instructed via `LLM_SYSTEM_PROMPT` to output *only* a valid JSON object matching a specific Pydantic-style schema, with absolutely no conversational filler.

### Step 5: Multi-lingual Action Plan Generation (Bonus E)
- **Action:** The LLM generates the final payload.
- **Output:** It returns a structured 3-step treatment plan translated natively into **English, Hindi, and Gujarati**. It explicitly names the required chemical (e.g., "Copper Fungicide") or organic treatment required, ensuring the farmer has exactly the information they need in their native tongue.

---

## 2. Dynamic Sustainability Engine (Bonus D)

AgriSmart AI actively promotes sustainable farming. The system evaluates the treatment plan and the weather context to estimate environmental savings:
- **Rain Prevention:** If rain is >30%, the AI advises *delaying* chemical sprays.
- **Metrics Calculation:** By preventing runoff and optimizing spray timing, the system dynamically calculates the estimated **liters of water saved per acre** and **chemical reduction percentages**.
- **Transparency:** The exact methodology used for the calculation is returned in the `methodology_note` field and displayed to the user.

---

## 3. Honest Limitations & Bulletproof Edge Cases

To ensure the system is robust enough for actual rural Indian farm conditions, we engineered specific fallbacks for known edge cases:

### Edge Case 1: "Healthy" Crop Detection
**The Problem:** If a user uploads a completely healthy leaf, pushing a strong chemical fungicide is dangerous, expensive, and wastes resources.
**The Solution:** The backend string-matches the ONNX prediction for `"healthy"`. If found, the LLM is bypassed entirely to save API costs and latency. The system automatically issues a pre-computed "MAINTAIN and MONITOR" action plan, estimating a 100% chemical reduction since no spray is needed.

### Edge Case 2: API Timeout / Rural Network Failure
**The Problem:** Rural cellular networks frequently drop connections. Furthermore, third-party LLM APIs can rate-limit or timeout. If the LLM fails, the farmer still desperately needs a treatment plan.
**The Solution:** We implemented a bulletproof fallback mechanism in `get_llm_fallback()`. If the LLM API call fails for *any* reason, the backend catches the `Exception` and instantly returns a pre-computed, safe, static 3-step action plan for the specific disease in all 3 languages. **The core product will never crash due to an LLM timeout.**

### Edge Case 3: LLM Hallucination of JSON Formatting
**The Problem:** Generative AI models occasionally hallucinate by wrapping JSON in markdown tags (e.g., ` ```json ... ``` `) or adding conversational filler ("Here is your plan:"). This instantly breaks standard frontend JSON parsers (`JSON.parse`).
**The Solution:** The backend implements a robust string extraction algorithm:
```python
start_idx = text.find("{")
end_idx = text.rfind("}")
json_str = text[start_idx:end_idx+1]
```
This guarantees that conversational filler is stripped out and the frontend always receives a valid, parsable JSON object.
