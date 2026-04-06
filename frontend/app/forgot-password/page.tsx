'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forgotPassword } from '../../lib/api/auth';
import { CheryVideoBackground } from '@/components/auth/CheryVideoBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [telephoneHint, setTelephoneHint] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email);
      if (result.telephone_hint) setTelephoneHint(result.telephone_hint);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="chery-auth-scene">
      <CheryVideoBackground />
      <div className="chery-auth-ambient" />
      <div className="chery-auth-grid" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
              Mot de passe oublie
            </h2>
            <p className="mt-2 text-center text-sm text-slate-300">
              Entrez votre adresse email pour recevoir un code de verification par WhatsApp.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-rose-400/40 bg-rose-500/10 p-4">
              <p className="text-sm text-rose-100">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="chery-auth-panel mt-8 space-y-6 rounded-2xl p-8"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200/10 bg-white/10 px-3 py-2 text-slate-100 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="votre.email@exemple.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-lg border border-[#ff6a72]/30 bg-gradient-to-r from-[#ff9a9f] to-[#f23f48] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(242,63,72,0.35)] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le code WhatsApp'}
            </button>

            <div className="text-center text-sm">
              <Link href="/login" className="font-medium text-slate-200 hover:text-white">
                Retour a la connexion
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
