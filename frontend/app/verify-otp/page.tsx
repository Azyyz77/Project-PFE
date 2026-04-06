'use client';

import { FormEvent, Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp } from '../../lib/api/auth';
import { AuthThemeShell } from '@/components/auth/AuthThemeShell';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const code = otp.join('');
    if (code.length !== 6) {
      setError('Veuillez entrer le code a 6 chiffres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyOtp(email, code);
      router.push(`/reset-password?token=${encodeURIComponent(result.resetToken)}`);
    } catch (err: any) {
      setError(err.message || 'Code incorrect ou expire');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthThemeShell>
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
              Verification WhatsApp
            </h2>
            <p className="mt-2 text-center text-sm text-slate-300">
              Entrez le code a 6 chiffres envoye par WhatsApp au numero associe a{' '}
              <span className="font-medium text-slate-100">{email}</span>.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-rose-400/40 bg-rose-500/10 p-4">
              <p className="text-sm text-rose-100">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="chery-auth-panel mt-8 space-y-6 rounded-2xl p-8">
            <div>
              <label className="mb-3 block text-center text-sm font-medium text-slate-300">
                Code OTP
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
                    aria-label={`Chiffre OTP ${index + 1}`}
                    title={`Chiffre OTP ${index + 1}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-12 w-12 rounded-lg border-2 border-slate-300/30 bg-white/10 text-center text-xl font-bold text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-colors"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.join('').length !== 6}
              className="flex w-full justify-center rounded-lg border border-[#ff6a72]/30 bg-gradient-to-r from-[#ff9a9f] to-[#f23f48] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(242,63,72,0.35)] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Verification...' : 'Verifier le code'}
            </button>

            <div className="space-y-2 text-center text-sm">
              <p className="text-slate-300">
                Vous n&apos;avez pas recu le code ?{' '}
                <Link href="/forgot-password" className="font-medium text-slate-100 hover:text-white">
                  Renvoyer
                </Link>
              </p>
              <Link href="/login" className="font-medium text-slate-200 hover:text-white">
                Retour a la connexion
              </Link>
            </div>
          </form>
        </div>
      </main>
    </AuthThemeShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}
