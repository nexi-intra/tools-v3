'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export type SupportedLanguage = "en" | "da" | "it";

type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
};

// Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Function to detect browser language
const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === 'undefined') {
    // Fallback if navigator is not available (e.g., during server-side rendering)
    return 'en';
  }

  const language = navigator.language.split('-')[0];
  if (language === 'it' || language === 'da') {
    return language as SupportedLanguage;
  }
  return 'en';
};

// Provider
type LanguageProviderProps = {
  children: ReactNode;
  initialLanguage?: SupportedLanguage;
};

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return initialLanguage || detectBrowserLanguage();
  });

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
