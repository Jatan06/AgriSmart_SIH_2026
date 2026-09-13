"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function TreatmentSection({ data }) {
  const [lang, setLang] = useState("en"); // "en" | "gu"
  const contentRef = useRef(null);

  // Mock treatment content mapped from data (if we have a real backend, we'd use data.ml_result.treatment_plan)
  // The structure requested is 3 steps: REMOVE, WAIT, TREAT
  const plan = {
    en: [
      { id: "01", action: "REMOVE", desc: "Remove visibly infected leaves.", time: "✓ NOW" },
      { id: "02", action: "WAIT", desc: "Allow the expected rain window to pass.", time: "◷ WAIT" },
      { id: "03", action: "TREAT", desc: "Apply the recommended treatment during the next suitable dry window.", time: "→ NEXT" },
    ],
    gu: [
      { id: "01", action: "દૂર કરો", desc: "દેખીતી રીતે ચેપગ્રસ્ત પાંદડા દૂર કરો.", time: "✓ હમણાં" },
      { id: "02", action: "રાહ જુઓ", desc: "અપેક્ષિત વરસાદની બારી પસાર થવા દો.", time: "◷ રાહ જુઓ" },
      { id: "03", action: "સારવાર", desc: "આગળની યોગ્ય સૂકી બારી દરમિયાન ભલામણ કરેલ સારવાર લાગુ કરો.", time: "→ આગળ" },
    ]
  };

  const steps = plan[lang];

  useGSAP(() => {
    // Fade in/out transition when language changes
    gsap.fromTo(contentRef.current, 
      { opacity: 0, y: 10 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [lang]);

  return (
    <section className="w-full bg-coffee text-paper py-12 md:py-16 px-6 md:px-16 relative">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-paper/60 mb-3">
              ACTION PLAN
            </div>
            <h2 className="font-heading text-3xl md:text-5xl leading-none text-paper">
              What to do now.
            </h2>
          </div>

          {/* Language Toggle */}
          <div className="mt-8 md:mt-0 flex items-center space-x-2 font-sans text-xs tracking-widest uppercase">
            <button 
              onClick={() => setLang("en")}
              className={`transition-colors ${lang === "en" ? "text-paper" : "text-paper/40 hover:text-paper/70"}`}
            >
              ENGLISH
            </button>
            <span className="text-paper/20">|</span>
            <button 
              onClick={() => setLang("gu")}
              className={`transition-colors ${lang === "gu" ? "text-paper" : "text-paper/40 hover:text-paper/70"}`}
            >
              ગુજરાતી
            </button>
          </div>
        </div>

        {/* Numbered Actions */}
        <div ref={contentRef} className="space-y-0">
          {steps.map((step, index) => (
            <div 
              key={`${lang}-${step.id}`} 
              className="group border-t border-paper/10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between cursor-default transition-transform duration-500 hover:translate-x-2"
            >
              
              <div className="flex flex-col md:flex-row md:items-baseline mb-4 md:mb-0 w-full md:w-auto">
                <span className="font-sans text-[10px] tracking-widest text-paper/40 md:mr-8 mb-2 md:mb-0">
                  {step.id}
                </span>
                <div>
                  <h3 className="font-heading text-xl md:text-2xl text-paper mb-1">{step.action}</h3>
                  <p className="font-sans text-paper/70 text-sm font-light max-w-sm">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div className="font-sans text-[10px] tracking-widest uppercase text-olive shrink-0">
                {step.time}
              </div>

            </div>
          ))}
          <div className="border-t border-paper/10"></div>
        </div>

      </div>
    </section>
  );
}
