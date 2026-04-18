'use client';

import { FormEvent, Suspense, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resendVerificationCode, verifyPhoneNumber } from '@/lib/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { AuthThemeShell } from '@/components/auth/AuthThemeShell';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Phone, RefreshCw } from 'lucide-react';

function VerifyPhoneContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout, refreshUser, isLoading } = useAuth();

  // Utiliser l'email de l'utilisateur connecté ou celui des paramètres de recherche
  const email = user?.email || searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [telephoneHint, setTelephoneHint] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Rediriger si l'utilisateur n'est pas connecté ou si le téléphone est déjà vérifié
  useEffect(() => {
    // Wait for AuthContext to finish loading before deciding to redirect
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.telephone_verifie) {
      // Rediriger vers le dashboard approprié selon le rôle
      const redirectMap: Record<string, string> = {
        CLIENT: '/client/dashboard',
        AGENT: '/dashboard/agent',
        ADMIN: '/dashboard/admin',
        DIRECTION: '/dashboard/direction',
      };
      router.push(redirectMap[user.role] || '/dashboard');
    }
  }, [user, router, isLoading]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const code = otp.join('');
    if (code.length !== 6) {
      setError('Veuillez entrer le code à 6 chiffres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyPhoneNumber(user?.email || email, code);
      setSuccess(result.message + ' Redirection en cours...');
      
      // Forcer une reconnexion pour obtenir un nouveau token avec telephone_verifie = true
      setTimeout(() => {
        // Supprimer le token actuel et rediriger vers la connexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear cookie with all matching attributes to ensure it is removed
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
        
        // Rediriger vers la connexion avec un message de succès
        window.location.href = '/login?phone_verified=true';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Code incorrect ou expiré');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      const result = await resendVerificationCode(user?.email || email);
      setSuccess('Code de vérification renvoyé par WhatsApp');
      setTelephoneHint(result.telephone_hint || '');
      setOtp(['', '', '', '', '', '']); // Reset OTP fields
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading || !user) {
    return null; // Waiting for AuthContext or redirecting
  }

  return (
    <AuthThemeShell>
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vérification du téléphone
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Entrez le code à 6 chiffres envoyé par WhatsApp au numéro{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {telephoneHint || (user?.telephone ? `***${user.telephone.slice(-3)}` : 'associé à votre compte')}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-lg">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm">{error}</p>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm">{success}</p>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 block text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  Code de vérification
                </label>
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`Chiffre ${index + 1}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="h-12 w-12 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-center text-xl font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || otp.join('').length !== 6}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                size="lg"
              >
                {isSubmitting ? 'Vérification...' : 'Vérifier le code'}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                Vous n&apos;avez pas reçu le code ?
              </p>
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
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthThemeShell>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    }>
      <VerifyPhoneContent />
    </Suspense>
  );
}