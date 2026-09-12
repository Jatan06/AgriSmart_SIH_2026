import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [language, setLanguage] = useState("en");

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "hi" : "en");
    // We will sync this with global state or local storage later if needed.
    // For now, it's just visual in the prototype.
  };

  return (
    <nav className="absolute top-0 w-full z-50 px-10 py-8 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
      <div className="flex items-center space-x-2 text-[#FCFCF7]">
        <span className="font-heading text-3xl font-medium tracking-wide">AgriSmart AI</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={toggleLanguage}
          className="bg-black/20 border-[#FCFCF7]/30 text-[#FCFCF7] hover:bg-[#FCFCF7] hover:text-[#1C1C13] transition-colors rounded-full px-6 font-sans tracking-wide backdrop-blur-sm"
        >
          {language === "en" ? "Translate to Hindi" : "Translate to English"}
        </Button>
      </div>
    </nav>
  );
}
