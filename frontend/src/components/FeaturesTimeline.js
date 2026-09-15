"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesTimeline() {
  const { t } = useLanguage();

  const FEATURES = [
    {
      num: "01",
      title: t('feat1_title'),
      desc: t('feat1_desc'),
    },
    {
      num: "02",
      title: t('feat2_title'),
      desc: t('feat2_desc'),
    },
    {
      num: "03",
      title: t('feat3_title'),
      desc: t('feat3_desc'),
    },
    {
      num: "04",
      title: t('feat4_title'),
      desc: t('feat4_desc'),
    }
  ];

  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  
  useGSAP(() => {
    // Animated vertical timeline progress line
    gsap.fromTo(lineRef.current,
      { scaleY: 0 }, // Removed transformOrigin here since it's in the CSS
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        }
      }
    );

    const features = gsap.utils.toArray(".feature-block");
    features.forEach((feature) => {
      const text = feature.querySelector(".feature-text-content");
      const num = feature.querySelector(".feature-num");
      const nodeRing = feature.querySelector(".feature-node-ring");
      const nodeDot = feature.querySelector(".feature-node-dot");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: feature,
          start: "top 85%",
          end: "top 35%",
          scrub: 1, // Smoothly ties the animation to the scrollbar
        }
      });

      // The massive faint number slides in subtly
      tl.fromTo(num, 
        { opacity: 0, x: -40 }, 
        { opacity: 0.08, x: 0, ease: "none" },
        0
      )
      // The text block fades up
      .fromTo(text, 
        { opacity: 0, y: 60 }, 
        { opacity: 1, y: 0, ease: "none" },
        0.1
      )
      // The elegant timeline node pop
      .fromTo(nodeRing,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, ease: "none" },
        0
      )
      .fromTo(nodeDot,
        { scale: 0 },
        { scale: 1, ease: "none" },
        0.2
      );
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="how-it-works" className="relative w-full py-32 md:py-48 bg-[#EAE0D5] text-[#1C1C13] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-16 relative">
        
        {/* Massive Editorial Title */}
        <div className="mb-32 md:mb-48 relative z-10 border-b border-[#1C1C13]/10 pb-12">
          <h2 className="font-heading text-[clamp(4rem,9vw,9rem)] leading-[0.9] tracking-tight font-light text-[#1C1C13]">
            {t('what_we_do')}
          </h2>
        </div>

        <div className="relative">
          {/* Static Background Line */}
          <div className="absolute top-0 left-4 md:left-[25%] w-[2px] h-full bg-[#1C1C13]/10"></div>
          {/* Animated Progress Line */}
          <div ref={lineRef} className="absolute top-0 left-4 md:left-[25%] w-[2px] h-full bg-[#6B4F3A] origin-top" style={{ transform: "scaleY(0)" }}></div>

          <div className="flex flex-col space-y-32 md:space-y-48 py-16">
            {FEATURES.map((feat, i) => (
              <div key={i} className="feature-block relative flex w-full">
                
                {/* Faint massive number on the far left */}
                <div className="feature-num hidden md:block absolute -top-16 left-0 font-heading text-[220px] leading-none text-[#1C1C13] opacity-0 pointer-events-none select-none z-0">
                  {feat.num}
                </div>

                {/* Timeline Node */}
                <div className="absolute left-4 md:left-[25%] top-4 md:top-6 transform -translate-x-1/2 flex items-center justify-center z-20">
                  <div className="feature-node-ring w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#FCFCF7] flex items-center justify-center border border-[#6B4F3A]/30 shadow-[0_0_20px_rgba(107,79,58,0.1)]">
                    <div className="feature-node-dot w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#6B4F3A]"></div>
                  </div>
                </div>

                {/* Content Block */}
                <div className="w-full pl-20 md:pl-[35%] relative">
                  
                  {/* Faint massive number for mobile only */}
                  <div className="feature-num block md:hidden absolute -top-12 left-0 font-heading text-[140px] leading-none text-[#1C1C13] opacity-0 pointer-events-none select-none">
                    {feat.num}
                  </div>
                  
                  <div className="feature-text-content relative z-10 max-w-2xl">
                    <h3 className="font-heading text-4xl md:text-6xl leading-[1.1] mb-6 md:mb-8 font-normal text-[#6B4F3A]">
                      {feat.title}
                    </h3>
                    <p className="font-sans text-lg md:text-2xl leading-relaxed text-[#1C1C13]/75 font-light">
                      {feat.desc}
                    </p>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
