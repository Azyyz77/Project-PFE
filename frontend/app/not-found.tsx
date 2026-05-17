'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-8">{t('common.pageNotFound')}</p>
        <p className="text-gray-600 mb-8">
          {t('common.pageNotFoundDesc')}
        </p>

        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {t('common.backToDashboard')}
        </Link>
      </div>
    </div>
  );
}

