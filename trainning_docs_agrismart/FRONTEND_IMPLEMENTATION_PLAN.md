# AgriSmart AI — Frontend Implementation Plan (Technical Master Document)

**Branch:** `feature/frontend`  
**Companion Docs:** `BACKEND_IMPLEMENTATION_PLAN.md`, `SYSTEM_ARCHITECTURE_MEGA_DOC.md`, `design.md`  
**Author:** To be executed by the Frontend team.  
**Purpose:** This document is the single source of truth for EVERY piece of frontend logic, state, API integration, component behaviour, error handling, and UI rendering. The backend is not yet operational, so the frontend must be built with a mock-data layer so it can be developed and tested independently.

---

## Execution Strategy: Chunked Implementation
To ensure high quality, perfect backend alignment, and avoid AI hallucination, this plan will be executed in **short, verifiable chunks**.

*   **Chunk 1: Foundation.** Next.js bootstrap, Shadcn UI setup, Tailwind config (colors/fonts from `design.md`), and basic folder structure.
*   **Chunk 2: Mock API & State.** Create `mockData.js`, `api.js` (pointing to `http://localhost:8000` via env var), and the main `page.jsx` state machine (`idle` -> `loading` -> `success` -> `error`).
*   **Chunk 3: Hero & Upload Zone.** Implement `HeroSection.jsx` (with looping video), `DropZone.jsx` (with `browser-image-compression`, 10MB limit, and **Image Preview** before clicking Analyze), and `Navbar.jsx` (with **Language Toggle**).
*   **Chunk 4: Results Dashboard.** Implement `DashboardGrid.jsx`, `DiseaseCard.jsx`, `WeatherCard.jsx`, `AgentPlanCard.jsx`, and `GreenImpactCard.jsx`. Map exactly to the JSON payload. Handle Gemini API fallback logic.
*   **Chunk 5: Polish & GSAP.** Add Lenis smooth scrolling, GSAP stagger reveal on the dashboard, hover animations, and final UI QA. *(Note: PWA features are deferred until post-hackathon).*

---

## 1. Project Bootstrap (Chunk 1)

```bash
# From the project root (SIH_2026/)
npx create-next-app@latest frontend \
  --typescript-no \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias

cd frontend

# Shadcn UI (Component Library)
npx shadcn-ui@latest init
# Select: Default style | CSS variables: Yes | Neutral base color | NO TypeScript

# Required Shadcn components
npx shadcn-ui@latest add button card progress alert badge

# Core dependencies
npm install axios react-dropzone lucide-react clsx tailwind-merge

# Animation stack
npm install @studio-freight/lenis gsap @gsap/react

# Image compression (Required for high-res farm photos)
npm install browser-image-compression
```

### Environment Variables
Create `frontend/.env.local`:
```
# Frontend runs on 5173 (or default 3000), Backend runs on 8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```
The frontend team should NEVER hardcode `localhost:8000` in a component. Always use `process.env.NEXT_PUBLIC_API_URL`.

---

## 2. Directory Structure (Complete)

```
frontend/
├── public/
│   └── hero-video.mp4        # Looping background jungle/farm video (optimized <5MB)
│
├── src/
│   ├── app/
│   │   ├── layout.jsx        # Root layout: Lenis provider, Google Fonts, metadata SEO
│   │   ├── page.jsx          # Main page orchestrator (see §4)
│   │   └── globals.css       # CSS custom properties (palette, typography variables)
│   │
│   ├── components/
│   │   ├── ui/               # Shadcn auto-generated components (DO NOT EDIT manually)
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.jsx            # Top navigation bar (Logo + Language Toggle)
│   │   │   └── Footer.jsx            # Minimal footer
│   │   │
│   │   ├── upload/
│   │   │   ├── HeroSection.jsx       # Full-screen video background + upload zone overlay
│   │   │   ├── DropZone.jsx          # react-dropzone logic (compression, validation, preview)
│   │   │   └── AnalyzeButton.jsx     # Main CTA button with loading state
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardGrid.jsx     # GSAP stagger parent grid
│   │   │   ├── DiseaseCard.jsx       # ml_result rendering
│   │   │   ├── WeatherCard.jsx       # weather_context rendering
│   │   │   ├── AgentPlanCard.jsx     # agent_advice rendering
│   │   │   └── GreenImpactCard.jsx   # sustainability_impact rendering
│   │   │
│   │   └── shared/
│   │       ├── LoadingOverlay.jsx    # Full-page loading state during API call
│   │       └── ErrorAlert.jsx        # Renders API/network timeouts & errors
│   │
│   ├── lib/
│   │   ├── api.js            # ALL axios logic, the only file that touches the backend URL
│   │   ├── mockData.js       # Static mock JSON for developing without backend
│   │   └── utils.js          # clsx, disease name formatter, severity color mapper
│   │
│   └── hooks/
│       ├── useGeolocation.js # Wraps navigator.geolocation with fallback
│       └── useLenis.js       # Initializes Lenis smooth scroll instance
```

---

## 3. API Integration (`src/lib/api.js`) — The Only Backend Touchpoint

This is the most critical file. Every component that needs data talks to this, not to `axios` directly.

```javascript
// src/lib/api.js
import axios from "axios";
import imageCompression from 'browser-image-compression';

const API_BASE = process.env.NEXT_PUBLIC_API_URL; // http://localhost:8000

/**
 * Sends a leaf image with geolocation to the backend for analysis.
 *
 * @param {File} imageFile - The raw File object from react-dropzone
 * @param {number} lat - Latitude (default: 20.5937 = center of India)
 * @param {number} lon - Longitude (default: 78.9629 = center of India)
 * @param {string} language - Language code for Gemini response (default: "en")
 * @returns {Promise<Object>} The exact JSON response from FastAPI
 * @throws {Error} If the request fails or the server returns non-2xx
 */
export async function analyzeLeaf(imageFile, lat = 20.5937, lon = 78.9629, language = "en") {
  
  // 1. Compress Image before sending to avoid FastAPI 1MB default limits / slow networks
  const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
  const compressedFile = await imageCompression(imageFile, options);

  const formData = new FormData();

  // CRITICAL: Do NOT set Content-Type header. Axios/browser handles multipart boundary automatically.
  // Backend FastAPI reads these fields as Form() parameters — names must match exactly.
  formData.append("image", compressedFile);   // matches: image: UploadFile = File(...)
  formData.append("lat", lat);           // matches: lat: float = Form(20.5937)
  formData.append("lon", lon);           // matches: lon: float = Form(78.9629)
  formData.append("language", language); // matches: language: str = Form("en")

  const response = await axios.post(`${API_BASE}/api/v1/detect`, formData, {
    timeout: 30000, // 30 second timeout — backend makes 3 serial API calls
  });

  return response.data; // Returns the full AgriSmart response object (see §5)
}
```

### Mock Data Mode (For Dev Without Backend)
```javascript
// src/lib/mockData.js — Use this while backend is not ready
export const MOCK_API_RESPONSE = {
  success: true,
  ml_result: {
    disease_class: "Tomato_Septoria_leaf_spot",
    confidence: 0.8734,
    severity: "High"
  },
  weather_context: {
    temperature_c: 32.5,
    humidity: 78,
    rain_probability: 85
  },
  agent_advice: {
    headline: "Apply Fungicide Before Rain",
    action_steps: [
      "Remove all visibly affected leaves immediately.",
      "Apply Mancozeb-based fungicide before the rain tomorrow."
    ],
    sustainability_impact: {
      water_saved_liters_per_acre: 12000,
      chemical_reduction_percent: 15,
      methodology_note: "Early intervention avoids heavy spraying later."
    },
    translated_message: "Apply fungicide today before the rain arrives."
  }
};
```

---

## 4. Page Orchestrator (`src/app/page.jsx`) — State Machine

This is the brain of the entire SPA. It manages the flow between the 3 major UI states.

### State Variables
```javascript
const [file, setFile] = useState(null);
// The raw File object from the dropzone. null if no file selected.

const [previewUrl, setPreviewUrl] = useState(null);
// Object URL for the selected image to show a preview before analyzing.

const [location, setLocation] = useState(null);
// { lat: number, lon: number } | null. Populated by useGeolocation hook.

const [language, setLanguage] = useState("en");
// "en" | "hi". Controlled by Navbar language toggle.

const [appStatus, setAppStatus] = useState("idle");
// "idle"     → Show the Hero section with upload form and image preview.
// "loading"  → Show LoadingOverlay. API call is in-flight.
// "success"  → Show DashboardGrid. apiData is populated.
// "error"    → Show ErrorAlert. apiError is populated.

const [apiData, setApiData] = useState(null);
const [apiError, setApiError] = useState(null);
```

### Core Handler Function
```javascript
const handleAnalyze = async () => {
  if (!file) return;

  setAppStatus("loading");
  setApiError(null);

  try {
    const lat = location?.lat ?? 20.5937;
    const lon = location?.lon ?? 78.9629;

    const data = await analyzeLeaf(file, lat, lon, language);

    // Validate the response has the expected shape before trusting it
    if (!data?.success || !data?.ml_result) {
      throw new Error("Invalid response shape from server.");
    }

    setApiData(data);
    setAppStatus("success");

  } catch (err) {
    let message = "Failed to connect to the AI engine.";
    if (err.code === 'ECONNABORTED') {
      message = "Request timed out. The AI engine is taking too long.";
    } else {
      message = err?.response?.data?.detail ?? err?.message ?? message;
    }
    setApiError(message);
    setAppStatus("error");
  }
};
```

---

## 5. Backend Response → Component Data Mapping (Complete)

This is the exact JSON the backend returns. Every field maps to a specific UI element.

```json
{
  "success": true,
  "ml_result": {
    "disease_class": "Tomato_Septoria_leaf_spot",
    "confidence": 0.8734,
    "severity": "High"
  },
  "weather_context": {
    "temperature_c": 32.5,
    "humidity": 78,
    "rain_probability": 85
  },
  "agent_advice": {
    "headline": "Apply Fungicide Before Rain",
    "action_steps": ["string", "string"],
    "sustainability_impact": {
      "water_saved_liters_per_acre": 12000,
      "chemical_reduction_percent": 15,
      "methodology_note": "..."
    },
    "translated_message": "...",
    "agent_status": "ok"  ← Only present on Gemini fallback ("unavailable")
  }
}
```

*(Remaining component mapping, hooks, GSAP, and File Validation logic remains the same as previously documented, perfectly aligned with the backend).*
