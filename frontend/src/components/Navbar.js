"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Change color after scrolling past a portion of the hero (e.g., 100px)
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const checkMode = () => {
      // If we can find the diagnosis section, we are on the results page
      const analyzeSection = document.getElementById("analyze");
      setIsAnalysisMode(!!analyzeSection);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Observer to detect when Diagnosis section is mounted
    const observer = new MutationObserver(checkMode);
    observer.observe(document.body, { childList: true, subtree: true });
    
    checkMode();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <nav 
      id="main-navbar"
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 flex justify-between items-center px-6 md:px-12 h-20 md:h-24 ${
        isScrolled || isAnalysisMode
          ? "bg-[#FCFCF7]/95 backdrop-blur-md shadow-sm text-[#1C1C13]" 
          : "bg-transparent text-white"
      }`}
    >
      {/* LEFT: Logo + Wordmark */}
      <a href="/" className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity">
        {/* Custom SVG Logo (Concentric growth rings / crop rows) */}
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="20" cy="20" r="3" fill="currentColor"/>
          <path d="M20 2V38" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <span className="font-sans font-semibold tracking-[0.15em] text-lg md:text-2xl">
          AGRISMART AI
        </span>
      </a>
      
      <div className="hidden md:flex items-center space-x-8 font-sans text-xs uppercase tracking-widest pointer-events-auto">
        {isAnalysisMode ? (
          <>
            <a href="/" className="hover:opacity-60 transition-opacity flex items-center gap-2 border border-[#1C1C13]/20 px-4 py-2 rounded hover:bg-[#1C1C13]/5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              {t('analyze_new_leaf')}
            </a>
            <a href="#analyze" className="hover:opacity-60 transition-opacity">{t('diagnosis')}</a>
            <a href="#weather" className="hover:opacity-60 transition-opacity">{t('weather')}</a>
            <a href="#treatment" className="hover:opacity-60 transition-opacity">{t('action_plan')}</a>
          </>
        ) : (
          <>
            <a href="/#analyze-section" className="hover:opacity-60 transition-opacity">{t('analyze')}</a>
            <a href="/#how-it-works" className="hover:opacity-60 transition-opacity">{t('how_it_works')}</a>
          </>
        )}
        
        {/* Native Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className={`ml-4 px-3 py-1.5 rounded text-[10px] md:text-xs font-bold transition-all border ${
            isScrolled || isAnalysisMode
              ? "border-coffee/20 hover:bg-coffee hover:text-paper" 
              : "border-white/30 hover:bg-white hover:text-coffee"
          }`}
        >
          {lang === 'en' ? 'HI' : lang === 'hi' ? 'GU' : 'EN'}
        </button>
      </div>

    </nav>
  );
}
