"use client";

import { useState } from "react";
import { analyzeLeaf } from "@/lib/api";
import { MOCK_API_RESPONSE } from "@/lib/mockData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import HeroSection from "@/components/HeroSection";
import FeaturesTimeline from "@/components/FeaturesTimeline";
import UploadSection from "@/components/UploadSection";
import DiagnosisSection from "@/components/DiagnosisSection";
import WeatherSection from "@/components/WeatherSection";
import TreatmentSection from "@/components/TreatmentSection";
import ImpactSection from "@/components/ImpactSection";
import TechnicalSection from "@/components/TechnicalSection";
import Footer from "@/components/Footer";

const LoadingOverlay = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] bg-paper">
    <div className="font-sans text-xs uppercase tracking-widest text-coffee/50 mb-4 animate-pulse">
      Analyzing Field...
    </div>
    <div className="w-full max-w-md h-px bg-coffee/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-full bg-olive w-1/3 animate-[slide_1.5s_ease-in-out_infinite]"></div>
    </div>
  </div>
);

export default function Home() {
  const [file, setFile] = useState(null); 
  const [appStatus, setAppStatus] = useState("idle"); // idle, loading, success, error
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);

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
      const data = await analyzeLeaf(selectedFile, lat, lon, "en");

      if (!data?.success || !data?.ml_result) {
        throw new Error("Invalid response shape from server.");
      }

      setApiData(data);
      setAppStatus("success");
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
            <LoadingOverlay />
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
          <ImpactSection />
          <TechnicalSection />
        </div>
      )}
      
      <Footer />
    </main>
  );
}
