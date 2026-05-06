'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-1 py-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <span className="px-2 text-slate-500 dark:text-white/60" title={t('language.select')}>
        <Globe className="h-4 w-4" />
      </span>

      <button
        onClick={() => setLanguage('fr')}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
          language === 'fr'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/10'
        }`}
        title={t('language.french')}
      >
        {t('language.frShort')}
      </button>

      <button
        onClick={() => setLanguage('en')}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
          language === 'en'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/10'
        }`}
        title={t('language.english')}
      >
        {t('language.enShort')}
      </button>

      <button
        onClick={() => setLanguage('ar')}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
          language === 'ar'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/10'
        }`}
        title={t('language.arabic')}
      >
        {t('language.arShort')}
      </button>
    </div>
  );
}
