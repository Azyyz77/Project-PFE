'use client';

import { useState, FormEvent, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { verifyOtp } from '../../lib/api/auth';

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
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
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
      setError('Veuillez entrer le code à 6 chiffres.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await verifyOtp(email, code);
      router.push(`/reset-password?token=${encodeURIComponent(result.resetToken)}`);
    } catch (err: any) {
      setError(err.message || 'Code incorrect ou expiré');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Vérification WhatsApp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez le code à 6 chiffres envoyé par WhatsApp au numéro associé à{' '}
            <span className="font-medium text-gray-800">{email}</span>.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Code OTP
            </label>
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-12 w-12 rounded-lg border-2 border-gray-300 text-center text-xl font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-colors"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.join('').length !== 6}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Vérification...' : 'Vérifier le code'}
          </button>

          <div className="text-center space-y-2 text-sm">
            <p className="text-gray-600">
              Vous n&apos;avez pas reçu le code ?{' '}
              <Link
                href={`/forgot-password`}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Renvoyer
              </Link>
            </p>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}
