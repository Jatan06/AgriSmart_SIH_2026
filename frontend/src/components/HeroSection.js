"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const shutterTopRef = useRef(null);
  const shutterBottomRef = useRef(null);
  const loaderLogoRef = useRef(null);

  useGSAP(() => {
    // 1. Initial Loader Logo & Shutters Animation
    const tl = gsap.timeline();
    
    // Animate logo SVG spinning in
    tl.fromTo(".loader-logo-spin", 
      { rotation: -90, scale: 0.8, opacity: 0 },
      { rotation: 0, scale: 1, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 }
    )
    // Slide in the text
    .fromTo(".loader-logo-text", 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    )
    // Hold it for the user to read
    .to({}, { duration: 0.8 })
    // Fade out the logo wrapper
    .to(loaderLogoRef.current, { opacity: 0, duration: 0.4 })
    
    // Then open the black shutters
    .to([shutterTopRef.current, shutterBottomRef.current], {
      height: 0,
      duration: 1.5,
      ease: "power3.inOut",
    }, "-=0.1")
    // 2. Initial Staggered Reveal (happens as shutters open)
    .from(".hero-element", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power3.out",
    }, "-=0.8");

    // 3. Proper ScrollTrigger Parallax
    // Only fade and move the text. Do not move the video to avoid clipping/black bars.
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      animation: gsap.timeline()
        .to(contentRef.current, { y: "-20%", opacity: 0, ease: "none" }, 0)
    });

    // Force video to start at 0s just in case
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#1C1C13]">
      
      {/* Loader Logo Overlay */}
      <div ref={loaderLogoRef} className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none">
        <div className="flex items-center space-x-6">
          <svg width="64" height="64" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="loader-logo-spin text-[#FCFCF7]">
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="3" fill="currentColor"/>
            <path d="M20 2V38" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span className="loader-logo-text font-sans font-semibold tracking-[0.2em] text-2xl md:text-3xl text-[#FCFCF7]">
            AGRISMART AI
          </span>
        </div>
      </div>

      {/* Black Shutters Loader */}
      <div 
        ref={shutterTopRef} 
        className="fixed top-0 left-0 w-full h-[50vh] bg-[#1C1C13] z-[200] origin-top"
      ></div>
      <div 
        ref={shutterBottomRef} 
        className="fixed bottom-0 left-0 w-full h-[50vh] bg-[#1C1C13] z-[200] origin-bottom"
      ></div>

      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden flex items-center justify-center bg-black">
        <video 
          ref={videoRef}
          src="/background.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover scale-[1.35]"
        />
        {/* Subtle earth/coffee overlay for typography contrast */}
        <div className="absolute inset-0 bg-[#1C1C13]/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C13]/80 to-transparent w-full md:w-2/3"></div>
      </div>

      {/* Hero Content - Asymmetrical Left */}
      <div 
        ref={contentRef}
        className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-5xl"
      >
        <h1 className="hero-element font-sans text-[clamp(4rem,8vw,9rem)] leading-[1.1] tracking-tight text-[#FCFCF7] mb-8 font-light max-w-4xl flex flex-col items-start">
          <span>Precision agriculture,</span>
          <span className="mt-2">
            guided by <span className="italic text-[#DBC8B7]">intelligence.</span>
          </span>
        </h1>
        
        <p className="hero-element font-sans text-base md:text-xl font-light text-[#FCFCF7]/80 max-w-md leading-relaxed mb-12">
          Visual intelligence meets local field conditions to determine exactly what your crop needs next.
        </p>

        <div className="hero-element">
          <button 
            onClick={() => document.getElementById('analyze-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center space-x-3 text-[#FCFCF7] hover:text-[#919166] transition-colors duration-300 font-sans text-xs uppercase tracking-widest"
          >
            <span className="border-b border-[#FCFCF7]/30 group-hover:border-[#919166] pb-1 transition-colors">Analyze Your Crop</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
      
    </section>
  );
}
