import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('bn');

  useEffect(() => {
    // Load language preference from localStorage
    const saved = localStorage.getItem('lms_language');
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lms_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
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

// Helper function to get localized text from an object
export function useLocalText(item, field) {
  const { language } = useLanguage();

  if (language === 'en' && item[`${field}_en`]) {
    return item[`${field}_en`];
  }
  return item[field];
}
