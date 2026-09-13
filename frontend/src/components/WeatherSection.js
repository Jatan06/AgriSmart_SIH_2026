"use client";

import { useState, useEffect } from "react";

// Animated bar — pure CSS transition, thicker and brighter
function StatBar({ value, max = 100 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 80);
    return () => clearTimeout(t);
  }, [value, max]);

  return (
    <div className="mt-4 h-[2px] w-full bg-paper/30 relative overflow-visible rounded-full">
      <div
        className="h-full bg-paper transition-all duration-[1200ms] ease-out rounded-full shadow-[0_0_8px_rgba(252,252,247,0.5)]"
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

// Count-up number animation
function CountUp({ target, suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const end = parseFloat(target) || 0;
    const step = end / 45;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { setVal(end); clearInterval(timer); }
      else setVal(current);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}{suffix}</>;
}

export default function WeatherSection({ data }) {
  const [whyOpen, setWhyOpen] = useState(false);

  const weather = data?.weather_context || {};
  const temp = weather.temperature_c ?? 27;
  const hum  = weather.humidity ?? 93;
  const rain = weather.rain_probability ?? 86;
  const wind = weather.wind_speed ?? 14;
  const uv   = weather.uv_index ?? 3;

  const isHighRisk = rain > 70;
  const isMedRisk  = rain > 40;

  let recLine1 = "Conditions are clear.";
  let recLine2 = "Treat now.";
  if (isHighRisk)  { recLine1 = "Rain imminent.";   recLine2 = "Do not apply treatment."; }
  else if (isMedRisk) { recLine1 = "Rain approaching."; recLine2 = "Apply treatment early."; }

  return (
    <section
      className="w-full py-16 px-6 md:px-16"
      // Much darker brown background for maximum contrast
      style={{ backgroundColor: "#36261A", color: "#FCFCF7" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ─── SECTION LABEL ─────────────────────────────────── */}
        <div
          className="font-sans text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-12"
          style={{ color: "#FCFCF7", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        >
          FIELD CONDITIONS
        </div>

        {/* ─── PRIMARY WEATHER STATS ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 mb-6 md:border-t md:border-b" style={{ borderColor: "rgba(252,252,247,0.2)" }}>
          {[
            { label: "TEMPERATURE", value: temp, suffix: "°C" },
            { label: "HUMIDITY",    value: hum,  suffix: "%" },
            { label: "RAIN PROBABILITY", value: rain, suffix: "%" },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`py-4 md:py-10 md:px-8 ${i > 0 ? "md:border-l" : ""}`}
              style={{ borderColor: "rgba(252,252,247,0.2)" }}
            >
              <div
                className="font-sans text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-4"
                style={{ color: "#FCFCF7", opacity: 0.9 }}
              >
                {item.label}
              </div>
              <div className="font-heading text-5xl md:text-6xl font-normal" style={{ color: "#FCFCF7", textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                <CountUp target={item.value} suffix={item.suffix} decimals={item.value % 1 !== 0 ? 1 : 0} />
              </div>
              <StatBar value={item.value} />
            </div>
          ))}
        </div>

        {/* ─── SECONDARY STATS ───────────────────────────────── */}
        <div className="flex gap-8 mb-16 px-4" style={{ color: "#FCFCF7" }}>
          <span className="font-sans text-sm font-medium tracking-widest uppercase">WIND {wind} km/h</span>
          <span style={{ color: "rgba(252,252,247,0.5)" }}>·</span>
          <span className="font-sans text-sm font-medium tracking-widest uppercase">UV INDEX {uv}</span>
        </div>

        {/* ─── 6-HOUR TIMELINE ───────────────────────────────── */}
        <div className="mb-16 px-4 bg-black/20 p-8 rounded-2xl border border-white/10">
          <div
            className="font-sans text-sm font-bold tracking-[0.3em] uppercase mb-12 text-center"
            style={{ color: "#FCFCF7" }}
          >
            6-HOUR OUTLOOK
          </div>

          <div className="relative mt-8">
            {/* Track */}
            <div
              className="absolute top-[9px] left-0 right-0 h-[2px]"
              style={{ backgroundColor: "rgba(252,252,247,0.3)" }}
            />
            {/* Dots + Labels */}
            <div className="relative flex justify-between items-start z-10 px-2 md:px-10">
              {["NOW", "+1H", "+2H", "+4H", "+6H"].map((label, idx) => {
                const isActive = idx === 2;
                return (
                  <div key={label} className="flex flex-col items-center gap-4 relative group cursor-default">
                    {/* Concentric rotating rings */}
                    {isActive && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0">
                        {/* Outer Ring */}
                        <div className="absolute w-[50px] h-[50px] rounded-full border-[1.5px] border-white/60 border-b-transparent border-l-transparent animate-[spin_4s_linear_infinite]" />
                        {/* Middle Ring */}
                        <div className="absolute w-[36px] h-[36px] rounded-full border-[1.5px] border-white/40 border-t-transparent border-r-transparent animate-[spin_2.5s_linear_infinite_reverse]" />
                        {/* Inner Ring */}
                        <div className="absolute w-[24px] h-[24px] rounded-full border-[1.5px] border-white/90 border-b-transparent border-r-transparent animate-[spin_1.5s_linear_infinite]" />
                      </div>
                    )}
                    <div
                      className="w-5 h-5 rounded-full border-2 transition-all duration-300 relative z-10"
                      style={{
                        borderColor: isActive ? "#FCFCF7" : "rgba(252,252,247,0.5)",
                        backgroundColor: isActive ? "#FCFCF7" : "#36261A",
                        boxShadow: isActive ? "0 0 15px rgba(252,252,247,0.8)" : "none",
                      }}
                    />
                    <span
                      className="font-sans text-xs md:text-sm font-bold tracking-widest uppercase mt-2"
                      style={{ color: isActive ? "#FCFCF7" : "rgba(252,252,247,0.7)" }}
                    >
                      {label}
                    </span>
                    {isActive && (
                      <span
                        className="font-sans text-sm font-bold tracking-widest uppercase absolute -bottom-8"
                        style={{ color: "#FCFCF7", textShadow: "0 0 10px rgba(252,252,247,0.5)" }}
                      >
                        RAIN
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── SEPARATOR ─────────────────────────────────────── */}
        <div className="flex items-center gap-6 mb-16 px-4">
          <div className="flex-1 h-[1px]" style={{ backgroundColor: "rgba(252,252,247,0.2)" }} />
          <span className="font-sans text-sm font-bold tracking-[0.3em] uppercase" style={{ color: "#FCFCF7" }}>
            AI INTERPRETATION
          </span>
          <div className="flex-1 h-[1px]" style={{ backgroundColor: "rgba(252,252,247,0.2)" }} />
        </div>

        {/* ─── AI RECOMMENDATION (HERO) ──────────────────────── */}
        <div className="flex flex-col md:flex-row gap-8 mb-16 px-4 items-start">
          {/* White vertical accent */}
          <div className="w-[4px] h-32 hidden md:block rounded-full self-stretch" style={{ backgroundColor: "#FCFCF7", boxShadow: "0 0 10px rgba(252,252,247,0.3)" }} />

          <div className="flex-1 border-l-4 md:border-l-0 pl-6 md:pl-0 border-white">
            <div
              className="font-sans text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-6"
              style={{ color: "#FCFCF7" }}
            >
              AI RECOMMENDATION
            </div>
            <h3
              className="font-heading leading-tight"
              style={{
                color: "#FCFCF7",
                fontSize: "clamp(2.5rem, 4vw, 4rem)",
                textShadow: "0 4px 12px rgba(0,0,0,0.4)"
              }}
            >
              {recLine1}
              <br />
              {recLine2}
            </h3>
          </div>
        </div>

        {/* ─── NEXT SAFE WINDOW ──────────────────────────────── */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-10 py-8 mb-12 rounded-xl"
          style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(252,252,247,0.2)" }}
        >
          <div>
            <div
              className="font-sans text-sm font-bold tracking-[0.3em] uppercase mb-3"
              style={{ color: "#FCFCF7" }}
            >
              NEXT SAFE WINDOW
            </div>
            <div className="font-sans text-4xl md:text-5xl font-medium tracking-[0.1em]" style={{ color: "#FCFCF7", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              18:40 – 20:10
            </div>
          </div>
          <div
            className="mt-6 md:mt-0 font-sans text-sm md:text-base font-bold tracking-[0.2em] uppercase px-6 py-4 rounded-lg shadow-lg"
            style={{ 
              color: "#36261A", 
              backgroundColor: "#FCFCF7",
            }}
          >
            ~90 MIN WINDOW
          </div>
        </div>

        {/* ─── WHY ACCORDION ─────────────────────────────────── */}
        <div className="px-4 bg-black/10 rounded-xl border border-white/10 p-6">
          <button
            onClick={() => setWhyOpen(!whyOpen)}
            className="group w-full flex justify-between items-center py-2 transition-colors"
          >
            <span
              className="font-sans text-sm md:text-base font-bold tracking-[0.2em] uppercase"
              style={{ color: "#FCFCF7" }}
            >
              Why this recommendation?
            </span>
            <span
              className="text-2xl leading-none transition-colors"
              style={{ color: "#FCFCF7" }}
            >
              {whyOpen ? "−" : "+"}
            </span>
          </button>

          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: whyOpen ? "250px" : "0px", opacity: whyOpen ? 1 : 0 }}
          >
            <p
              className="font-sans text-base md:text-lg leading-relaxed pt-6 pb-2"
              style={{ color: "rgba(252,252,247,0.9)" }}
            >
              With a <strong>{rain}% rain probability</strong> and <strong>{hum}% humidity</strong>, applying fungicide or pesticide
              now risks it being washed off before absorption. The <strong>18:40–20:10 window</strong> offers a dry
              spell with lower humidity and no precipitation — maximising treatment effectiveness.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
