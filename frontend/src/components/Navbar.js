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
    <nav className="absolute top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
      <div className="flex items-center space-x-2 text-white">
        <span className="font-heading text-2xl font-bold tracking-wider">AgriSmart AI</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={toggleLanguage}
          className="bg-black/20 border-white/30 text-white hover:bg-white hover:text-black transition-colors"
        >
          {language === "en" ? "Translate to Hindi" : "Translate to English"}
        </Button>
      </div>
    </nav>
  );
}
