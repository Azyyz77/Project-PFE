'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';

function GlobalErrorContent({ reset }: { reset: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">500</h1>
        <p className="text-xl text-gray-600 mb-2">{t('common.serverError')}</p>
        <p className="text-gray-600 mb-8">
          {t('common.criticalError')}
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {t('common.retry')}
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {t('common.home')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <LanguageProvider>
          <GlobalErrorContent reset={reset} />
        </LanguageProvider>
      </body>
    </html>
  );
}

