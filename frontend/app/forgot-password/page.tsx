'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forgotPassword } from '../../lib/api/auth';
import { AuthThemeShell } from '@/components/auth/AuthThemeShell';
import { Alert } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err) || "Erreur lors de l'envoi";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthThemeShell videoBackground={true} videoOverlayOpacity={0.6}>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
        <section className="hidden flex-1 lg:flex flex-col justify-center pr-12">
          <div className="space-y-6">
            <div>
              <div className="-mb-6">
                <img src="/chery-logo-clean.png" alt="Chery" className="h-24 w-72 object-contain object-left" />
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                Mot de passe <br />
                <span className="text-red-500">oublié</span>
              </h1>
              <p className="mt-4 text-base text-white/90 max-w-lg leading-relaxed drop-shadow-md">
                Entrez votre adresse email pour recevoir un code de vérification par WhatsApp.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-emerald-400/60 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm">Réinitialisation rapide via WhatsApp</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto lg:mx-0 mt-12">
          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-black via-zinc-950 to-black backdrop-blur-md p-8 shadow-2xl shadow-red-500/10 sm:p-10">
            <h2 className="text-2xl font-bold text-white text-center">Mot de passe oublié</h2>
            <p className="mt-2 text-sm text-zinc-400 text-center">Entrez votre adresse email pour recevoir un code de vérification.</p>

            {error && (
              <div className="mt-4">
                <Alert className="border-red-500/50 bg-red-950/50 text-red-300">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">Adresse email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-800 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500/20 sm:text-sm"
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg border border-[#ff6a72]/30 bg-gradient-to-r from-[#ff9a9f] to-[#f23f48] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(242,63,72,0.35)] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le code WhatsApp'}
              </button>

              <div className="text-center text-sm">
                <Link href="/login" className="font-medium text-slate-200 hover:text-white">Retour à la connexion</Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </AuthThemeShell>
  );
}
