'use client';

/**
 * Verify OTP Page - Refactored with shadcn/ui
 */

import { useState, FormEvent, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthCard } from '@/components/auth/AuthCard';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { verifyOtp } from '../../lib/api/auth';
import { validateOtp } from '@/lib/auth-utils';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    const validationError = validateOtp(otp);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const code = otp.join('');
      const result = await verifyOtp(email, code);
      router.push(`/reset-password?token=${encodeURIComponent(result.resetToken)}`);
    } catch (err: any) {
      setError(err.message || 'Code incorrect ou expiré');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Vérification WhatsApp"
      subtitle={`Entrez le code à 6 chiffres envoyé à ${email}`}
      bottomLink={{
        text: "Vous n'avez pas reçu le code ?",
        href: "/forgot-password",
        linkText: "Renvoyer"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </Alert>
        )}

        {/* OTP Code */}
        <div className="space-y-4">
          <Label className="text-center block">Code OTP</Label>
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
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
                disabled={isSubmitting}
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg border-2 border-gray-300 text-center text-lg sm:text-xl font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100"
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Vous pouvez aussi coller le code
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || otp.join('').length !== 6}
          size="lg"
        >
          {isSubmitting ? 'Vérification en cours...' : 'Vérifier le code'}
        </Button>

        {/* Back Link */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push('/login')}
        >
          Retour à la connexion
        </Button>
      </form>
    </AuthCard>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpContent />
    </Suspense>
  );
}
