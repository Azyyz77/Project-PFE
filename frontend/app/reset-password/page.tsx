'use client';

/**
 * Reset Password Page - Refactored with shadcn/ui
 */

import { useState, FormEvent } from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthCard } from '@/components/auth/AuthCard';
import { AlertCircle, Lock } from 'lucide-react';
import { resetPassword } from '../../lib/api/auth';
import {
  ResetPasswordFormState,
  EMPTY_RESET_PASSWORD_FORM,
  validateResetPasswordForm,
} from '@/lib/auth-utils';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [form, setForm] = useState<ResetPasswordFormState>(EMPTY_RESET_PASSWORD_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    const validationErrors = validateResetPasswordForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, form.password);
      router.push('/login?reset=true');
    } catch (err: any) {
      setApiError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="rounded-xl bg-white p-8 shadow-lg text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <p className="text-red-600 font-semibold">Lien de réinitialisation invalide.</p>
          <Button onClick={() => router.push('/forgot-password')}>
            Recommencer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe sécurisé (minimum 6 caractères)"
      bottomLink={{
        text: "Vous vous souvenez de votre mot de passe ?",
        href: "/login",
        linkText: "Se connecter"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Error */}
        {apiError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">{apiError}</p>
          </Alert>
        )}

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Nouveau mot de passe
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
