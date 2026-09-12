"use client";

import { useState } from "react";
import { analyzeLeaf } from "@/lib/api";
import { MOCK_API_RESPONSE } from "@/lib/mockData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import HeroSection from "@/components/HeroSection";

const LoadingOverlayPlaceholder = () => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-background z-50 fixed inset-0">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <h2 className="text-2xl font-heading animate-pulse text-foreground">Analyzing Plant Health...</h2>
  </div>
);

const DashboardPlaceholder = ({ data, onReset }) => (
  <div className="min-h-screen p-8 bg-background">
    <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto mt-12">
      <h1 className="text-4xl font-heading text-foreground font-bold">Diagnosis Complete</h1>
      <Button onClick={onReset}>← Analyze Another</Button>
    </div>
    <div className="max-w-5xl mx-auto">
      <pre className="bg-card p-6 rounded-xl border border-border text-sm overflow-auto text-card-foreground shadow-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  </div>
);

export default function Home() {
  const [file, setFile] = useState(null); 
  const [appStatus, setAppStatus] = useState("idle"); 
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleAnalyze = async (selectedFile) => {
    setFile(selectedFile);
    setAppStatus("loading");
    setApiError(null);

    try {
      // MOCK MODE: Simulate network delay and use mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      const data = MOCK_API_RESPONSE;

      // REAL MODE (Will be active when we hook up dropzone to real backend):
      // const data = await analyzeLeaf(selectedFile, 20.5937, 78.9629, "en");

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

  const handleReset = () => {
    setFile(null);
    setApiData(null);
    setApiError(null);
    setAppStatus("idle");
  };

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/20">
      
      {appStatus === "idle" && (
        <HeroSection onAnalyze={handleAnalyze} />
      )}

      {appStatus === "loading" && (
        <LoadingOverlayPlaceholder />
      )}

      {appStatus === "error" && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
          <Alert variant="destructive" className="max-w-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
          <Button onClick={handleReset} variant="outline">Go Back</Button>
        </div>
      )}

      {appStatus === "success" && (
        <DashboardPlaceholder data={apiData} onReset={handleReset} />
      )}
      
    </main>
  );
}
