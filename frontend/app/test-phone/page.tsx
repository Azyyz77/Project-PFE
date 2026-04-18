'use client';

import { PhoneVerificationTest } from '@/components/PhoneVerificationTest';

export default function TestPhonePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Test de Vérification Téléphonique
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Page de test pour vérifier le système de vérification téléphonique
          </p>
        </div>

        <PhoneVerificationTest />

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Instructions de Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Connectez-vous avec un compte client non vérifié</li>
            <li>Utilisez le bouton "Renvoyer le code" pour générer un OTP</li>
            <li>Vérifiez les logs du backend pour voir le code généré</li>
            <li>Entrez le code dans le champ OTP et cliquez "Vérifier"</li>
            <li>Le statut devrait passer à "Téléphone vérifié: Oui"</li>
          </ol>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Note de Développement
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Cette page est uniquement pour les tests de développement. 
            En production, supprimez cette route ou protégez-la avec une authentification admin.
          </p>
        </div>
      </div>
    </div>
  );
}