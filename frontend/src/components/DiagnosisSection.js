"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function DiagnosisSection({ data, file }) {
  const containerRef = useRef(null);
  const confidenceRef = useRef(null);
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (file) {
      setObjectUrl(URL.createObjectURL(file));
    }
  }, [file]);

  useGSAP(() => {
    // Staggered reveal for diagnosis text
    gsap.from(".diag-element", {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "power3.out",
    });

    // Severity pulse (one-time)
    gsap.from(".severity-dot", {
      scrollTrigger: {
        trigger: ".severity-dot",
        start: "top 85%",
      },
      scale: 2,
      opacity: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });

    // Confidence Count Up
    const confidenceValue = (parseFloat(data?.ml_result?.confidence) || 0) * 100;
    
    gsap.to(confidenceRef.current, {
      scrollTrigger: {
        trigger: confidenceRef.current,
        start: "top 90%",
      },
      innerText: confidenceValue,
      duration: 1.5,
      snap: { innerText: 0.1 },
      ease: "power2.out",
      onUpdate: function() {
        if (confidenceRef.current) {
          // ensure 1 decimal place
          const val = parseFloat(this.targets()[0].innerText);
          confidenceRef.current.innerText = val.toFixed(1) + "%";
        }
      }
    });

  }, { scope: containerRef, dependencies: [data] });

  let diseaseName = data?.ml_result?.disease_class || "Unknown Pathogen";
  
  // Extract crop dynamically (e.g., "Tomato_Septoria_leaf_spot" -> "TOMATO")
  const crop = diseaseName.split("_")[0].toUpperCase();
  
  // Clean up the disease string
  diseaseName = diseaseName.replace(`${crop}_`, "").replace(/_/g, " ");
  const isHealthy = diseaseName.toLowerCase().includes("healthy");

  return (
    <section id="analyze" ref={containerRef} className="w-full bg-paper text-coffee py-12 md:py-16 px-6 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT: Compact Editorial Leaf Photograph */}
        <div className="lg:col-span-4 w-full relative max-w-sm mx-auto lg:mx-0">
          <div className="w-full aspect-square overflow-hidden bg-earth/10">
            {objectUrl && (
              <img 
                src={objectUrl} 
                alt="Analyzed leaf" 
                className="w-full h-full object-cover grayscale-[15%] hover:scale-105 transition-transform duration-[2s] ease-out"
              />
            )}
            <div className="absolute inset-0 bg-coffee/5 mix-blend-multiply"></div>
          </div>
          {/* Minimal metadata overlay */}
          <div className="absolute -left-6 md:-left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-center hidden md:block">
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-coffee/40">
              FIELD ANALYSIS &middot; VISION DATA
            </span>
          </div>
        </div>

        {/* RIGHT: Diagnosis Result */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          <div className="diag-element font-sans text-[10px] tracking-[0.2em] uppercase text-coffee/50 mb-6">
            AI FIELD ANALYSIS
          </div>

          <div className="diag-element font-sans text-xs tracking-widest uppercase text-coffee mb-2">
            {crop}
          </div>

          <h2 className="diag-element font-heading text-4xl md:text-5xl leading-[1.1] tracking-tight mb-8">
            {diseaseName}
          </h2>

          <div className="diag-element flex flex-col md:flex-row md:items-center gap-8 border-t border-coffee/20 pt-6 mt-auto">
            
            {/* Severity */}
            <div>
              <div className="font-sans text-[10px] tracking-widest uppercase text-coffee/50 mb-3">
                Condition
              </div>
              <div className="flex items-center space-x-3">
                <span className={`severity-dot w-3 h-3 rounded-full ${isHealthy ? 'bg-olive' : 'bg-[#A33327]'}`}></span>
                <span className="font-sans text-sm tracking-widest uppercase text-coffee">
                  {isHealthy ? "OPTIMAL" : "HIGH SEVERITY"}
                </span>
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div className="font-sans text-[10px] tracking-widest uppercase text-coffee/50 mb-3">
                Diagnostic Confidence
              </div>
              <div className="font-sans text-4xl font-light text-coffee flex items-baseline">
                <span ref={confidenceRef}>0.0%</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
