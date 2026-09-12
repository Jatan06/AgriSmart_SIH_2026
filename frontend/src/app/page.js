"use client";

import { useState } from "react";
import { analyzeLeaf } from "@/lib/api";
import { MOCK_API_RESPONSE } from "@/lib/mockData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Note: These sub-components will be built in Chunks 3 & 4
const HeroSectionPlaceholder = ({ onAnalyze }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6">
    <h1 className="text-5xl font-heading text-primary">AgriSmart AI</h1>
    <p className="text-xl text-muted-foreground max-w-2xl">
      Upload a leaf photo and get an AI-powered disease diagnosis with actionable treatment plans.
    </p>
    <div className="border-2 border-dashed border-primary/50 rounded-xl p-12 bg-card">
      <p className="mb-4">Drag and drop your leaf image here</p>
      <Button onClick={onAnalyze} className="w-full h-12 text-lg">Analyze Leaf</Button>
    </div>
  </div>
);

const LoadingOverlayPlaceholder = () => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <h2 className="text-2xl font-heading animate-pulse text-foreground">Analyzing Plant Health...</h2>
  </div>
);

const DashboardPlaceholder = ({ data, onReset }) => (
  <div className="min-h-screen p-8">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-heading text-foreground">Diagnosis Complete</h1>
      <Button variant="outline" onClick={onReset}>← Analyze Another</Button>
    </div>
    <pre className="bg-card p-6 rounded-xl border text-sm overflow-auto text-card-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

export default function Home() {
  const [file, setFile] = useState(null); // Will hold the actual File later
  const [appStatus, setAppStatus] = useState("idle"); // idle, loading, success, error
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleAnalyze = async () => {
    // We will pass the actual file in Chunk 3, for now we just test the state machine
    setAppStatus("loading");
    setApiError(null);

    try {
      // MOCK MODE: Simulate network delay and use mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      const data = MOCK_API_RESPONSE;

      // REAL MODE (Will be active when we hook up dropzone):
      // const data = await analyzeLeaf(file, 20.5937, 78.9629, "en");

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
        <HeroSectionPlaceholder onAnalyze={handleAnalyze} />
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
