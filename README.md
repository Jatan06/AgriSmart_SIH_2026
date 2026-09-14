# AgriSmart AI

AgriSmart AI is an instant crop diagnosis platform powered by a highly optimized ConvNeXt-V2-Base machine learning model and the Google Gemini API. It analyzes crop leaf images, cross-references live weather conditions via Open-Meteo, and generates an actionable, localized treatment plan for farmers.

## 🚀 How to Run the Project Locally

The project is split into a Next.js frontend and a FastAPI backend. You will need two terminal windows to run it.

### 1. Start the Backend (FastAPI + ONNX ML Inference)

The backend runs our 90.9% accurate ConvNeXt-V2 machine learning model using `onnxruntime` for extremely fast CPU inference.

```bash
# Navigate to the project root
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Start the server (runs on http://localhost:8000)
python -m uvicorn api.main:app --reload
```

### 2. Start the Frontend (Next.js)

```bash
# Open a new terminal window
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` or `http://localhost:5173` in your browser.

---

## 🔑 Important Note for Evaluators: Gemini API Key

Because this repository is public, we cannot commit our private API keys.

By default, if you run the project **without an API key**, the backend is engineered with a **graceful fallback mechanism**. The application will NOT crash. The ML model will still correctly diagnose the crop disease, the live weather API will still fetch data, and the UI will render perfectly using a static, generic agronomist action plan.

If you wish to experience the **full, dynamic AI agronomist** (which writes hyper-specific chemical treatment recommendations based on the ML diagnosis and live weather constraints), you must provide a Gemini API key:

1. Navigate to the `api/` directory.
2. Create a file named `.env`
3. Add the following line:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Restart the backend server. The app will automatically switch from the static fallback to live LLM generation.
