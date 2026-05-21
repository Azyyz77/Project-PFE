'use client';

import { useRouter } from 'next/navigation';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Oops! Une erreur est survenue</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{error.message || 'Une erreur inattendue s\'est produite.'}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
