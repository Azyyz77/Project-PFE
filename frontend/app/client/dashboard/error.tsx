'use client';

import { useRouter } from 'next/navigation';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-[#050505] dark:text-white mb-2">Oops! Une erreur est survenue</h1>
        <p className="text-[#65676B] dark:text-[#B0B3B8] mb-6">{error.message || 'Une erreur inattendue s\'est produite.'}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#050505] dark:text-white rounded-lg font-medium transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
