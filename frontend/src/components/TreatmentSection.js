"use client";

import { useState } from "react";

export default function TreatmentSection({ data }) {
  const [lang, setLang] = useState("en");

  // Mock treatment content
  const plan = {
    en: [
      { id: "01", action: "REMOVE", desc: "Remove visibly infected leaves.", status: "✓ NOW" },
      { id: "02", action: "WAIT", desc: "Allow the expected rain window to pass.", status: "◷ WAIT" },
      { id: "03", action: "TREAT", desc: "Apply the recommended treatment during the next suitable dry window.", status: "→ NEXT" },
    ],
    gu: [
      { id: "01", action: "દૂર કરો", desc: "દેખીતી રીતે ચેપગ્રસ્ત પાંદડા દૂર કરો.", status: "✓ હમણાં" },
      { id: "02", action: "રાહ જુઓ", desc: "અપેક્ષિત વરસાદની બારી પસાર થવા દો.", status: "◷ રાહ જુઓ" },
      { id: "03", action: "સારવાર", desc: "આગળની યોગ્ય સૂકી બારી દરમિયાન ભલામણ કરેલ સારવાર લાગુ કરો.", status: "→ આગળ" },
    ]
  };

  const steps = plan[lang];

  return (
    <section className="w-full bg-coffee text-paper py-24 px-6 md:px-16 overflow-hidden">
      {/* Wider editorial max-width (1280px-1400px) */}
      <div className="max-w-[1300px] mx-auto">
        
        {/* HEADER & LANGUAGE TOGGLE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-paper/10 pb-8">
          
          <div>
            <div className="font-sans text-xs tracking-[0.12em] uppercase text-paper/60 mb-4">
              ACTION PLAN
            </div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-paper">
              What to do now.
            </h2>
          </div>

          <div className="mt-8 md:mt-0 flex items-center gap-3 font-sans text-xs tracking-widest uppercase">
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

        {/* ACTIONS LIST */}
        <div className="w-full md:w-[80%]">
          {steps.map((step, index) => (
            <div 
              key={`${lang}-${step.id}`}
              className="group border-b border-paper/10 py-10 md:py-12 flex flex-col md:grid md:grid-cols-12 gap-6 items-start md:items-center transition-transform duration-500 ease-out hover:translate-x-2"
            >
              
              {/* COLUMN 1: Number */}
              <div className="md:col-span-2">
                <span className="font-sans text-xs tracking-widest text-paper/40">
                  {step.id}
                </span>
              </div>

              {/* COLUMN 2: Title & Description */}
              <div className="md:col-span-8 flex flex-col justify-center">
                <h3 className="font-heading text-2xl md:text-3xl text-paper mb-3 group-hover:text-olive transition-colors duration-500">
                  {step.action}
                </h3>
                <p className="font-sans text-sm md:text-base text-paper/70 font-light max-w-md">
                  {step.desc}
                </p>
              </div>

              {/* COLUMN 3: Status */}
              <div className="md:col-span-2 md:text-right mt-4 md:mt-0">
                <span className="font-sans text-[10px] md:text-xs tracking-widest uppercase text-olive opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {step.status}
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* TRANSITION TO NEXT SECTION */}
        <div className="mt-24 text-center">
          <div className="font-sans text-[10px] tracking-widest uppercase text-paper/40 mb-4">
            HOW AGRISMART DECIDED
          </div>
          <svg width="12" height="18" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-paper/20 mx-auto">
            <path d="M6 1V17M6 17L1 12M6 17L11 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

      </div>
    </section>
  );
}
