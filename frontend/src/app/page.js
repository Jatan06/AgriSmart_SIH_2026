"use client";

import { useState, useEffect } from "react";
import { analyzeLeaf } from "@/lib/api";
import { MOCK_API_RESPONSE } from "@/lib/mockData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

import HeroSection from "@/components/HeroSection";
import FeaturesTimeline from "@/components/FeaturesTimeline";
import UploadSection from "@/components/UploadSection";
import DiagnosisSection from "@/components/DiagnosisSection";
import WeatherSection from "@/components/WeatherSection";
import TreatmentSection from "@/components/TreatmentSection";
import ImpactSection from "@/components/ImpactSection";
import TechnicalSection from "@/components/TechnicalSection";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const AgenticReasoningOverlay = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => setStep(4), 3200)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    "Initializing ConvNeXt-V2 Vision Model...",
    "Scanning Leaf Morphology for Pathogens...",
    "Fetching Live Open-Meteo Satellite Data...",
    "Correlating Rain Probability with Runoff Risks...",
    "AgriSmart Agent Synthesizing Weather-Aware Action Plan..."
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-paper px-6">
      <div className="w-full max-w-lg bg-coffee/5 p-6 md:p-8 rounded-xl border border-coffee/10 shadow-sm relative overflow-hidden">
        
        {/* Animated scanning bar */}
        <div className="absolute top-0 left-0 h-1 bg-olive w-1/4 animate-[slide_1.5s_ease-in-out_infinite]"></div>

        <div className="font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] text-coffee/40 mb-6 flex items-center">
          <div className="w-2 h-2 bg-olive rounded-full animate-pulse mr-2"></div>
          Agentic Reasoning Pipeline
        </div>
        
        <div className="space-y-4">
          {steps.map((text, index) => (
            <div 
              key={index} 
              className={`font-sans text-xs md:text-sm tracking-wide transition-all duration-500 flex items-start space-x-3 ${
                index <= step ? "text-coffee opacity-100 transform translate-y-0" : "text-coffee/0 opacity-0 transform translate-y-4"
              }`}
            >
              <span className="text-olive font-bold mt-0.5">{index < step ? "✓" : (index === step ? "⟳" : "")}</span>
              <span className={index === step ? "animate-pulse" : ""}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { lang } = useLanguage();
  const [file, setFile] = useState(null); 
  const [appStatus, setAppStatus] = useState("idle"); // idle, loading, success, error
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (appStatus === "success") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [appStatus]);

  const handleAnalyze = async (selectedFile) => {
    setFile(selectedFile);
    setAppStatus("loading");
    setApiError(null);

    try {
      // Get location if available
      let lat = 20.5937; // Default: Center of India
      let lon = 78.9629;
      
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        } catch (e) {
          console.warn("Location access denied or timeout. Using default.");
        }
      }

      // Call the actual FastAPI backend
      const data = await analyzeLeaf(selectedFile, lat, lon, lang);

      if (!data?.success || !data?.ml_result) {
        throw new Error("Invalid response shape from server.");
      }

      setApiData(data);
      setAppStatus("success");
      
      // Save context for the global Chatbot
      sessionStorage.setItem("agriSmartContext", JSON.stringify(data));
    } catch (err) {
      setApiError("Failed to connect to the AI engine.");
      setAppStatus("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setApiData(null);
    setApiError(null);
    setAppStatus("idle");
    sessionStorage.removeItem("agriSmartContext");
  };

  return (
    <main className="min-h-screen bg-paper text-coffee relative font-sans selection:bg-olive/20">
      
      {/* 
        The Hero is only shown when we don't have results yet.
        Once results are in, the Diagnosis becomes the Hero.
      */}
      {(appStatus === "idle" || appStatus === "loading" || appStatus === "error") && (
        <>
          <HeroSection />
          
          {appStatus === "idle" && (
            <>
              <FeaturesTimeline />
              <UploadSection onAnalyze={handleAnalyze} />
            </>
          )}

          {appStatus === "loading" && (
            <AgenticReasoningOverlay />
          )}

          {appStatus === "error" && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] bg-paper px-6">
              <div className="max-w-xl text-center">
                <h3 className="font-heading text-4xl mb-4 text-coffee">Analysis Failed</h3>
                <p className="font-sans text-coffee/60 mb-8">{apiError}</p>
                <Button 
                  onClick={handleReset} 
                  variant="outline"
                  className="bg-transparent border border-coffee/30 text-coffee hover:bg-coffee hover:text-paper rounded-none uppercase text-xs tracking-widest px-8"
                >
                  Return to Field
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dynamic Results Section (Only shown after upload) */}
      {apiData && (
        <div className="pt-[var(--navbar-height)] scroll-mt-[var(--navbar-height)]">
          <DiagnosisSection data={apiData} file={file} />
          

          <WeatherSection data={apiData} />
          <TreatmentSection data={apiData} />
          <ImpactSection data={apiData} />
          <TechnicalSection />
          <Chatbot />
        </div>
      )}
      
      <Footer />
    </main>
  );
}
