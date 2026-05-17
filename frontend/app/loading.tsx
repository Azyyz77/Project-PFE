'use client';

import { Spinner } from '@/components/ui/Spinner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Loading() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Spinner className="h-12 w-12 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{t('common.loading')}</p>
      </div>
    </div>
  );
}

