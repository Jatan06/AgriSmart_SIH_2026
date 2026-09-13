"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";

export default function WeatherSection({ data }) {
  const [whyExpanded, setWhyExpanded] = useState(false);
  const contentRef = useRef(null);
  
  const weather = data?.weather_context || {};
  const temp = weather.temperature_c ? Math.round(weather.temperature_c) : 28;
  const humidity = weather.humidity || 76;
  const rainProb = weather.rain_probability || 82;

  useGSAP(() => {
    if (whyExpanded) {
      gsap.to(contentRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      });
    }
  }, [whyExpanded]);

  return (
    <section className="w-full bg-earth text-paper py-12 md:py-16 px-6 md:px-16 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        
        <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-paper/60 mb-8">
          FIELD CONDITIONS
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-8 md:gap-12 mb-12 border-b border-paper/10 pb-8">
          <div>
            <div className="font-heading text-3xl md:text-5xl font-light mb-2">{temp}&deg;</div>
            <div className="font-sans text-[10px] uppercase tracking-widest text-paper/60">Temperature</div>
          </div>
          <div>
            <div className="font-heading text-3xl md:text-5xl font-light mb-2">{humidity}%</div>
            <div className="font-sans text-[10px] uppercase tracking-widest text-paper/60">Humidity</div>
          </div>
          <div>
            <div className="font-heading text-3xl md:text-5xl font-light mb-2">{rainProb}%</div>
            <div className="font-sans text-[10px] uppercase tracking-widest text-paper/60">Rain Prob</div>
          </div>
        </div>

        {/* Minimal Timeline */}
        <div className="mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-paper/20 -translate-y-1/2"></div>
          {/* GSAP animated rain curve concept */}
          <svg className="absolute top-0 left-0 w-full h-full text-olive opacity-80" viewBox="0 0 1000 100" preserveAspectRatio="none">
             <path d="M0 80 Q 250 80 400 20 T 800 80 L 1000 80" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
          
          <div className="relative z-10 flex justify-between items-center w-full">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-paper mb-4"></div>
              <span className="font-sans text-xs tracking-widest">NOW</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-paper/40 mb-4"></div>
              <span className="font-sans text-xs tracking-widest text-paper/60">+1H</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-olive mb-4 shadow-[0_0_15px_rgba(145,145,102,0.6)]"></div>
              <span className="font-sans text-xs tracking-widest text-olive font-bold">+2H</span>
            </div>
            <div className="flex flex-col items-center hidden md:flex">
              <div className="w-2 h-2 rounded-full bg-paper/40 mb-4"></div>
              <span className="font-sans text-xs tracking-widest text-paper/60">+4H</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-paper/40 mb-4"></div>
              <span className="font-sans text-xs tracking-widest text-paper/60">+6H</span>
            </div>
          </div>
        </div>

        {/* Causality Statement */}
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          
          <div className="font-heading text-2xl md:text-3xl text-paper mb-4">
            Rain expected in 2 hours.
          </div>
          
          <ArrowDown className="w-5 h-5 text-olive mb-4 opacity-80" strokeWidth={1} />
          
          <div className="font-heading text-2xl md:text-3xl text-paper mb-6">
            Treatment should wait.
          </div>
          
          <div className="border border-olive/30 px-6 py-4 flex flex-col items-center justify-center mb-8">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-paper/60 mb-1">Next Safe Window</span>
            <span className="font-sans text-lg md:text-xl text-olive tracking-widest">18:40 – 20:10</span>
          </div>

          {/* Expandable Why */}
          <div className="w-full text-left border-t border-paper/10 pt-6">
            <button 
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="font-sans text-xs uppercase tracking-widest text-paper/70 hover:text-paper transition-colors w-full flex justify-between items-center"
            >
              <span>Why this recommendation?</span>
              <span className="text-lg leading-none">{whyExpanded ? "−" : "+"}</span>
            </button>
            <div ref={contentRef} className="h-0 opacity-0 overflow-hidden">
              <p className="font-sans text-paper/80 font-light leading-relaxed mt-6 text-sm md:text-base max-w-lg">
                Rain is expected in approximately 2 hours. Applying treatment now could reduce treatment 
                effectiveness because rainfall may wash the product away before it is absorbed. 
                The next suitable treatment window is expected between 18:40 and 20:10 when dry conditions stabilize.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
