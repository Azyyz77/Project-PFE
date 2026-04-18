'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resendVerificationCode } from '@/lib/api/auth';
import { AuthThemeShell } from '@/components/auth/AuthThemeShell';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { CheckCircle2, Phone, RefreshCw, ArrowRight } from 'lucide-react';

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [telephoneHint, setTelephoneHint] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleResendCode = async () => {
    if (!email) return;
    
    setIsResending(true);
    setMessage('');

    try {
      const result = await resendVerificationCode(email);
      setMessage('Code de vérification renvoyé par WhatsApp');
      setTelephoneHint(result.telephone_hint || '');
    } catch (err: any) {
      setMessage(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <AuthThemeShell>
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inscription réussie !
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Votre compte a été créé avec succès pour{' '}
              <span className="font-medium text-slate-900 dark:text-white">{email}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-lg space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 text-amber-600 dark:text-amber-400">
                <Phone className="h-5 w-5" />
                <span className="font-semibold">Vérification téléphonique requise</span>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Un code de vérification a été envoyé par WhatsApp au numéro{' '}
                {telephoneHint && (
                  <span className="font-medium text-slate-900 dark:text-white">
                    {telephoneHint}
                  </span>
                )}
                {' '}associé à votre compte.
              </p>

              {message && (
                <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm">{message}</p>
                </Alert>
              )}
            </div>

            <div className="space-y-4">
              <Link href={`/verify-phone?email=${encodeURIComponent(email)}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Vérifier mon téléphone
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending}
                className="w-full"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Envoi en cours...' : 'Renvoyer le code'}
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Vous pourrez vous connecter après avoir vérifié votre téléphone
              </p>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Retour à la connexion
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AuthThemeShell>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}