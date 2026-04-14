'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={t('language.select')}
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">
          {language === 'fr' ? 'FR' : 'AR'}
        </span>
      </button>
    </div>
  );
}
