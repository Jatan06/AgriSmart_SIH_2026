# AgriSmart AI

AgriSmart AI is an instant crop diagnosis platform powered by a highly optimized ConvNeXt-V2-Base machine learning model and advanced AI logic. It analyzes crop leaf images, cross-references live weather conditions via Open-Meteo, and generates an actionable, localized treatment plan for farmers.

**Key Features:**
- **90%+ Accuracy Machine Learning:** Lightning-fast edge CPU inference using `onnxruntime` with an advanced 350MB model.
- **Multilingual Support:** Fully translated UI and dynamic AI analysis provided natively in English, Hindi, and Gujarati.
- **Contextual Arbitration:** The logic engine prevents chemical runoff by checking live local weather data before issuing pesticide recommendations.

---

## 🚀 How to Run the Project Locally

The project is split into a Next.js frontend and a FastAPI backend. You will need two terminal windows to run it.

### 0. Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18+)
- **Python 3**
- **Git LFS**: You must have Git Large File Storage installed to download the heavy ML models. Run `git lfs install` in your terminal.

### 1. Clone the Repository
```bash
git clone https://github.com/LA777am/AgriSmart_SIH_2026.git
cd AgriSmart_SIH_2026
git lfs pull
```
*(Note: `git lfs pull` is crucial. It downloads the ~350MB AI `.onnx.data` model and the frontend background video into their correct directories.)*

### 2. Start the Backend (FastAPI + ONNX ML Inference)

```bash
# Set up a Python virtual environment at the project root
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows

# Install all required Python dependencies
pip install -r requirements.txt

# Navigate to the API folder and start the server
cd api
uvicorn main:app --reload
```
*(The backend will now run on `http://localhost:8000`)*

### 3. Start the Frontend (Next.js)

```bash
# Open a new terminal window at the project root
cd frontend
npm install
npm run dev
```
*(The frontend UI will now run on `http://localhost:3000`)*

---

## 🔑 Important Note for Evaluators: API Key

Because this repository is public, we cannot commit our private API keys.

By default, if you run the project **without an API key**, the backend is engineered with a **graceful fallback mechanism**. The application will NOT crash. The ML model will still correctly diagnose the crop disease, the live weather API will still fetch data, and the UI will render perfectly using a static, generic agronomist action plan.

If you wish to experience the **full, dynamic AI agronomist** (which writes hyper-specific chemical treatment recommendations in 3 languages based on the ML diagnosis and live weather constraints), you must provide an API key:

1. Navigate to the `api/` directory.
2. Create a file named `.env`
3. Add the following line with a valid Groq API Key (which we currently use for ultra-fast Llama-3 inference):
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. Restart the backend server. The app will automatically switch from the static fallback to live LLM generation!
