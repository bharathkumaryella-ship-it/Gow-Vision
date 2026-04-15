import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export default function LanguageSelector({ className = "", isMobile = false }: { className?: string, isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: t('english'), flag: '🇺🇸' },
    { code: 'hi', name: t('hindi'), flag: '🇮🇳' },
    { code: 'te', name: t('telugu'), flag: '🇮🇳' },
  ] as const;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isMobile 
            ? "flex items-center space-x-3 px-4 py-4 rounded-xl text-base font-semibold transition-all text-emerald-100 hover:bg-emerald-800/50 hover:text-white w-full"
            : "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 text-emerald-100 hover:text-white hover:bg-emerald-800/30 group"
        }`}
        title={t('selectLanguage')}
      >
        <Globe className={`${isMobile ? "w-5 h-5" : "w-5 h-5 transition-transform duration-500 " + (isOpen ? 'rotate-12 scale-110' : 'group-hover:rotate-12')}`} />
        <span>{t('selectLanguage')}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? -10 : 10, scale: 0.95 }}
            className={`absolute ${isMobile ? 'left-0 right-0 bottom-full mb-2' : 'right-0 mt-3'} w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900 z-[110]`}
          >
            <div className="p-4 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center gap-2 text-stone-600 font-bold text-sm uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                {t('selectLanguage')}
              </div>
            </div>
            
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    language === lang.code
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-3 bg-stone-50 border-t border-stone-100 text-[10px] text-stone-400 text-center uppercase tracking-widest font-bold">
              Gow Vision v1.0.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
