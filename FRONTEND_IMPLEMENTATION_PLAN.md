# AgriSmart AI — Frontend Implementation Plan (Technical Master Document)

**Branch:** `feature/frontend`  
**Companion Docs:** `BACKEND_IMPLEMENTATION_PLAN.md`, `SYSTEM_ARCHITECTURE_MEGA_DOC.md`, `design.md`  
**Author:** To be executed by the Frontend team.  
**Purpose:** This document is the single source of truth for EVERY piece of frontend logic, state, API integration, component behaviour, error handling, and UI rendering. The backend is not yet operational, so the frontend must be built with a mock-data layer so it can be developed and tested independently.

---

## ⚠️ OPEN QUESTIONS FOR AYUSH — MUST BE ANSWERED BEFORE CODING STARTS

> These decisions affect the entire frontend architecture. Answered questions should be updated here.

1. **Backend URL (Production):** The backend plan says `http://localhost:8000`. When deployed at the hackathon, will it run on the same machine as the browser, or will there be a server IP? We need an `NEXT_PUBLIC_API_URL` env variable strategy so the frontend team can switch from `localhost` to the real IP without touching code.
2. **Image Size Limit:** FastAPI default max upload size is **~1MB**. Farmers use mobile phones with large camera images (5–10MB). Do we need to add client-side compression (e.g., `browser-image-compression` npm package) before sending, or will the backend team increase the limit?
3. **Loading Timeout:** The backend makes 3 serial calls (ONNX → Weather API → Gemini). On a slow hackathon network, this could take 10–30 seconds. What should happen on the frontend if it takes longer than 30 seconds — show a timeout error, or keep waiting?
4. **Language Toggle:** The API accepts a `language` field (e.g., `"en"`, `"hi"`). Do you want a UI dropdown/toggle for this now (Hindi / English), or hardcode to English for the MVP?
5. **Image Preview:** After the user selects a leaf image, should we show a thumbnail preview of it inside the upload zone BEFORE they click "Analyze Crop"?
6. **PWA (Progressive Web App):** `SYSTEM_ARCHITECTURE_MEGA_DOC.md §7` mentions PWA via `next-pwa`. Should this be implemented now, or is it a post-hackathon feature?

---

## 1. Project Bootstrap

```bash
# From the project root (SIH_2026/)
npx create-next-app@latest frontend \
  --typescript-no \ # Using plain JavaScript
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

# (Optional based on answer to Q2) Image compression
npm install browser-image-compression
```

### Environment Variables
Create `frontend/.env.local`:
```
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
│   │   │   ├── Navbar.jsx            # Top navigation bar (Logo + optional language toggle)
│   │   │   └── Footer.jsx            # Minimal footer
│   │   │
│   │   ├── upload/
│   │   │   ├── HeroSection.jsx       # Full-screen video background + upload zone overlay
│   │   │   ├── DropZone.jsx          # react-dropzone logic (file validation, preview)
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
│   │       └── ErrorAlert.jsx        # Renders API/network errors
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
  const formData = new FormData();

  // CRITICAL: Do NOT set Content-Type header. Axios/browser handles multipart boundary automatically.
  // Backend FastAPI reads these fields as Form() parameters — names must match exactly.
  formData.append("image", imageFile);   // matches: image: UploadFile = File(...)
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

To toggle between mock and real: in `page.jsx`, change one line:
```javascript
// REAL: const data = await analyzeLeaf(file, location.lat, location.lon);
// MOCK: const data = MOCK_API_RESPONSE; await new Promise(r => setTimeout(r, 2000)); // simulate 2s delay
```

---

## 4. Page Orchestrator (`src/app/page.jsx`) — State Machine

This is the brain of the entire SPA. It manages the flow between the 3 major UI states.

### State Variables
```javascript
const [file, setFile] = useState(null);
// The raw File object from the dropzone. null if no file selected.

const [location, setLocation] = useState(null);
// { lat: number, lon: number } | null. Populated by useGeolocation hook.
// If null, backend defaults to center of India (already handled by api.js default args).

const [appStatus, setAppStatus] = useState("idle");
// "idle"     → Show the Hero section with upload form.
// "loading"  → Show LoadingOverlay. API call is in-flight.
// "success"  → Show DashboardGrid. apiData is populated.
// "error"    → Show ErrorAlert. apiError is populated.

const [apiData, setApiData] = useState(null);
// The full JSON response from FastAPI. null until status === "success".

const [apiError, setApiError] = useState(null);
// Error message string. null unless status === "error".
```

### Core Handler Function
```javascript
const handleAnalyze = async () => {
  // Guard: Do not proceed if no file is selected
  if (!file) return;

  setAppStatus("loading");
  setApiError(null);

  try {
    const lat = location?.lat ?? 20.5937;
    const lon = location?.lon ?? 78.9629;

    const data = await analyzeLeaf(file, lat, lon, "en");

    // Validate the response has the expected shape before trusting it
    if (!data?.success || !data?.ml_result) {
      throw new Error("Invalid response shape from server.");
    }

    setApiData(data);
    setAppStatus("success");

  } catch (err) {
    // Covers: network errors, CORS errors, 500s, timeouts, invalid JSON
    const message = err?.response?.data?.detail
      ?? err?.message
      ?? "Failed to connect to the AI engine. Make sure the backend server is running.";
    setApiError(message);
    setAppStatus("error");
  }
};

const handleReset = () => {
  // Allows the user to go back and analyze another leaf
  setFile(null);
  setApiData(null);
  setApiError(null);
  setAppStatus("idle");
};
```

### Render Logic
```jsx
return (
  <>
    <Navbar onReset={appStatus !== "idle" ? handleReset : null} />

    {/* State: idle — show upload form */}
    {appStatus === "idle" && (
      <HeroSection
        file={file}
        setFile={setFile}
        location={location}
        onAnalyze={handleAnalyze}
      />
    )}

    {/* State: loading */}
    {appStatus === "loading" && <LoadingOverlay />}

    {/* State: error — show error, allow retry */}
    {appStatus === "error" && (
      <>
        <ErrorAlert message={apiError} onRetry={handleReset} />
      </>
    )}

    {/* State: success — show the full dashboard */}
    {appStatus === "success" && (
      <DashboardGrid data={apiData} onReset={handleReset} />
    )}
  </>
);
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

### 5.1 `DiseaseCard.jsx` ← maps `data.ml_result`
- `disease_class`: display after running through `formatDiseaseName()` util (replaces `___` with ` — `, replaces `_` with space). e.g. `"Tomato_Septoria_leaf_spot"` → `"Tomato — Septoria leaf spot"`
- `confidence`: multiply by 100, round to 1 decimal for the Shadcn `<Progress value={conf * 100} />` bar and percentage label.
- `severity`: Map to UI color:
  - `"High"` → Red card tint (`bg-red-50 border-red-300`)
  - `"Medium"` → Orange/Amber tint
  - `"Low"` → Yellow tint
  - If `disease_class` contains the word `"healthy"` → Green tint (override all severity colors)

### 5.2 `WeatherCard.jsx` ← maps `data.weather_context`
- `temperature_c`: Display as `32.5°C`. Simple.
- `humidity`: Display as `78%` with a humidity icon (Lucide: `Droplets`).
- `rain_probability`: Display as `85%`. If > 70%, show a warning badge (Shadcn `<Badge variant="destructive">Heavy Rain Expected</Badge>`).

### 5.3 `AgentPlanCard.jsx` ← maps `data.agent_advice`
- `headline`: Render as a `<h2>` card title.
- `action_steps`: Render as an ordered checklist using `<ul>` with custom checkbox icons.
- `translated_message`: Render below the steps in a subtle italic style, labeled `"In your language:"`.
- **Gemini Fallback Detection:**
  ```javascript
  const isGeminiFailed = data.agent_advice?.agent_status === "unavailable";
  ```
  If `isGeminiFailed === true`, render a Shadcn `<Alert variant="destructive">` that says: `"AI Agronomist is temporarily unavailable. Your crop diagnosis is still accurate."` The ML and Weather cards still render normally.

### 5.4 `GreenImpactCard.jsx` ← maps `data.agent_advice.sustainability_impact`
- **ALWAYS use optional chaining** to prevent crashes when Gemini fails:
  ```javascript
  const impact = data.agent_advice?.sustainability_impact;
  const waterSaved = impact?.water_saved_liters_per_acre ?? 0;
  const chemReduction = impact?.chemical_reduction_percent ?? 0;
  const note = impact?.methodology_note ?? "Data unavailable";
  ```
- `water_saved_liters_per_acre`: Display as `"12,000 Liters / Acre"` (use `toLocaleString()` for comma formatting).
- `chemical_reduction_percent`: Display as `"15% less chemicals"`.
- `methodology_note`: Display as small caption text.

---

## 6. Custom Hooks

### `useGeolocation.js`
```javascript
// src/hooks/useGeolocation.js
import { useState, useEffect } from "react";

export function useGeolocation() {
  const [location, setLocation] = useState(null); // {lat, lon} | null
  const [geoStatus, setGeoStatus] = useState("idle"); // "idle" | "granted" | "denied"

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("denied"); // Fallback lat/lon will be used automatically
      }
    );
  }, []);

  return { location, geoStatus };
}
```

### `useLenis.js`
```javascript
// src/hooks/useLenis.js
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smooth: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}
```

---

## 7. GSAP Animations

### Card Stagger Reveal (`DashboardGrid.jsx`)
When `appStatus` transitions from `"loading"` to `"success"`, trigger this:
```javascript
useEffect(() => {
  if (!data) return;
  gsap.fromTo(
    ".dashboard-card",
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power3.out" }
  );
}, [data]);
```
Each card must have `className="dashboard-card"` applied.

### Card Hover Zoom (`DiseaseCard`, `WeatherCard`, etc.)
```javascript
const cardRef = useRef(null);
// On mouseenter:
gsap.to(cardRef.current, { scale: 1.03, duration: 0.3, ease: "power2.out" });
// On mouseleave:
gsap.to(cardRef.current, { scale: 1.0, duration: 0.3, ease: "power2.out" });
```

---

## 8. File Validation Logic (`DropZone.jsx`)

```javascript
// react-dropzone config
const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
  accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
  maxFiles: 1,
  maxSize: 10 * 1024 * 1024, // 10MB client-side limit (pending Q2 answer from Ayush)
  onDrop: (accepted, rejected) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
    }
    // Handle rejected files (wrong type, too large)
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      alert(err.code === "file-too-large" ? "Image is too large. Max 10MB." : "Only JPG/PNG/WEBP accepted.");
    }
  }
});
```

---

## 9. Error Handling Matrix

| Scenario | Source | Frontend Behavior |
|---|---|---|
| No file selected, user clicks Analyze | Client-side guard | Button disabled until `file !== null` |
| User denies geolocation | `useGeolocation` | Status shows "Location unavailable, using default". API call still proceeds with India fallback |
| Network error (backend not running) | Axios timeout/network | `appStatus = "error"`, `ErrorAlert` with "Make sure the backend server is running at localhost:8000" |
| Backend returns HTTP 422 (bad form data) | FastAPI validation | `appStatus = "error"`, display `err.response.data.detail` from FastAPI |
| Backend returns HTTP 500 | Server crash | `appStatus = "error"`, generic message |
| Gemini API fails (backend handles internally) | `agent_status: "unavailable"` in JSON | `appStatus = "success"` still. Only `AgentPlanCard` shows a soft warning alert. Other 3 cards render normally |
| `success: false` in response body | Backend logic error | Treat same as HTTP error — `appStatus = "error"` |
| Response timeout (>30 seconds) | Axios `timeout: 30000` | `appStatus = "error"`, "Request timed out. The AI engine is taking too long." |

---

## 10. Navbar Logic (`Navbar.jsx`)

- **Logo:** "AgriSmart AI" text in serif font (Cormorant/Playfair).
- **If `appStatus === "idle"`:** No extra buttons.
- **If `appStatus === "success"`:** Show an "← Analyze Another" button that calls `handleReset()` (passed as `onReset` prop).
- **Language Toggle (Pending Q4):** If approved, a simple `<Select>` with `EN | HI` options that updates the `language` state variable in `page.jsx`.

---

## 11. SEO Metadata (`layout.jsx`)

```javascript
export const metadata = {
  title: "AgriSmart AI — Instant Crop Disease Detection",
  description: "Upload a leaf photo and get an AI-powered disease diagnosis with actionable treatment plans in seconds.",
  keywords: ["crop disease detection", "agriculture AI", "plant disease", "SIH 2026", "AgriSmart"],
  openGraph: {
    title: "AgriSmart AI",
    description: "AI-powered crop disease detection for Indian farmers.",
    type: "website",
  },
};
```

---

## Open Questions Summary

| # | Question | Impact |
|---|---|---|
| Q1 | Production backend URL strategy | `NEXT_PUBLIC_API_URL` env var |
| Q2 | Image size limit & compression | `maxSize` in DropZone, optional `browser-image-compression` |
| Q3 | Loading timeout threshold | `timeout` in axios config |
| Q4 | Language toggle in UI now? | Adds `<Select>` to Navbar |
| Q5 | Show thumbnail preview after file select? | DropZone `preview` state |
| Q6 | PWA implementation now? | `next-pwa` plugin in `next.config.mjs` |
