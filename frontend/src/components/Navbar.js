"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const [language, setLanguage] = useState("en");

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "gu" : "en");
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Change color after scrolling past a portion of the hero (e.g., 100px)
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(() => {
    // GSAP is no longer used for navbar toggling to avoid DOMTokenList errors.
  }, []);

  return (
    <nav 
      id="main-navbar"
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 flex justify-between items-center px-6 md:px-12 h-20 md:h-24 ${
        isScrolled 
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
        <a href="/#analyze-section" className="hover:opacity-60 transition-opacity">Analyze</a>
        <a href="/#how-it-works" className="hover:opacity-60 transition-opacity">How it Works</a>
      </div>

    </nav>
  );
}
