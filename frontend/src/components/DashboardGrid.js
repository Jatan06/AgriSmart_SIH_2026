import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, CloudRain, ShieldAlert, Droplets, CheckCircle, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const DiseaseCard = ({ mlResult }) => (
  <Card className="dashboard-card col-span-1 border-primary/20 shadow-md">
    <CardHeader className="bg-primary/5 pb-4">
      <CardTitle className="flex items-center text-xl font-heading text-primary">
        <Leaf className="w-5 h-5 mr-2" />
        AI Diagnosis
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Detected Issue</p>
          <p className="text-2xl font-bold text-foreground">
            {mlResult.disease_class.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex justify-between items-center border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="font-semibold">{(mlResult.confidence * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Severity</p>
            <Badge variant={mlResult.severity === "High" ? "destructive" : "secondary"}>
              {mlResult.severity}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const WeatherCard = ({ weather }) => (
  <Card className="dashboard-card col-span-1 border-border shadow-sm">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center text-lg font-heading">
        <CloudRain className="w-5 h-5 mr-2 text-blue-500" />
        Local Conditions
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6 flex justify-between">
      <div className="text-center">
        <p className="text-3xl font-bold">{weather.temperature_c}°C</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Temp</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold">{weather.humidity}%</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Humidity</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600">{weather.rain_probability}%</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Rain Prob</p>
      </div>
    </CardContent>
  </Card>
);

const AgentPlanCard = ({ advice }) => (
  <Card className="dashboard-card col-span-1 lg:col-span-2 border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
    <CardHeader className="bg-primary/10 border-b border-primary/10">
      <CardTitle className="flex items-center text-2xl font-heading text-primary">
        <ShieldAlert className="w-6 h-6 mr-2" />
        {advice.headline}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="mb-6">
        <h4 className="font-semibold text-lg mb-3 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-primary" /> Immediate Action Required
        </h4>
        <ul className="space-y-3">
          {advice.action_steps.map((step, idx) => (
            <li key={idx} className="flex items-start bg-white p-3 rounded-lg border border-border shadow-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold mr-3">
                {idx + 1}
              </span>
              <span className="text-foreground/90">{step}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-secondary p-4 rounded-xl">
        <p className="text-sm font-medium mb-1">Local Language Summary:</p>
        <p className="text-lg italic text-secondary-foreground">"{advice.translated_message}"</p>
      </div>
    </CardContent>
  </Card>
);

const GreenImpactCard = ({ impact }) => (
  <Card className="dashboard-card col-span-1 lg:col-span-2 border-green-700/20 shadow-md bg-gradient-to-br from-green-50 to-emerald-50/20">
    <CardContent className="pt-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-green-800 mb-2 flex items-center">
            <Droplets className="w-5 h-5 mr-2" />
            Sustainability Impact
          </h4>
          <p className="text-sm text-green-700/80">{impact.methodology_note}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-green-100">
            <p className="text-3xl font-black text-green-600">{impact.water_saved_liters_per_acre}L</p>
            <p className="text-xs uppercase tracking-wide text-green-800/60 mt-1">Water Saved / Acre</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-green-100">
            <p className="text-3xl font-black text-green-600">-{impact.chemical_reduction_percent}%</p>
            <p className="text-xs uppercase tracking-wide text-green-800/60 mt-1">Chemical Use</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardGrid({ data, onReset }) {
  const container = useRef(null);

  useGSAP(() => {
    gsap.from(".dashboard-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
    });
  }, { scope: container });

  if (!data) return null;

  return (
    <div ref={container} className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Analysis Results</h1>
            <p className="text-muted-foreground">Generated instantly by AgriSmart AI</p>
          </div>
          <Button onClick={onReset} variant="outline" className="shadow-sm hover:scale-105 transition-transform">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Analyze Another
          </Button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DiseaseCard mlResult={data.ml_result} />
          <WeatherCard weather={data.weather_context} />
          <AgentPlanCard advice={data.agent_advice} />
          <GreenImpactCard impact={data.agent_advice.sustainability_impact} />
        </div>

      </div>
    </div>
  );
}
