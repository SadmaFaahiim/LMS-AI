import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
      className="px-3 py-1.5 text-xs font-mono border border-bg-tertiary rounded-lg hover:border-accent-primary transition-colors text-text-secondary hover:text-text-primary"
      title={language === 'bn' ? 'Switch to English' : 'বাংলায় স্যুইচ করুন'}
    >
      {language === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
    </button>
  );
}
