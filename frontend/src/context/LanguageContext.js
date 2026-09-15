"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  // On mount, check if there's a saved preference in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('agrismart_lang');
    if (saved && ['en', 'gu', 'hi'].includes(saved)) {
      setLang(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const cycle = { 'en': 'hi', 'hi': 'gu', 'gu': 'en' };
    const newLang = cycle[lang] || 'en';
    setLang(newLang);
    localStorage.setItem('agrismart_lang', newLang);
  };

  const t = (key, params = {}) => {
    // If the key doesn't exist in the selected language, fallback to English or the key itself
    let str = translations[lang][key] || translations['en'][key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
