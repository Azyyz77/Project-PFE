'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Oups ! Une erreur s'est produite</h1>
        <p className="text-gray-600 mb-8">
          {error.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
