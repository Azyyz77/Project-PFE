'use client';

/**
 * Forgot Password Page - Refactored with shadcn/ui
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthCard } from '@/components/auth/AuthCard';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../../lib/api/auth';
import {
  ForgotPasswordFormState,
  EMPTY_FORGOT_PASSWORD_FORM,
  validateForgotPasswordForm,
} from '@/lib/auth-utils';

export default function ForgotPasswordPage() {
  const [form, setForm] = useState<ForgotPasswordFormState>(EMPTY_FORGOT_PASSWORD_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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

    const validationErrors = validateForgotPasswordForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword(form.email);
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setApiError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Entrez votre email pour recevoir un code de vérification par WhatsApp"
      bottomLink={{
        text: "Vous avez retrouvé votre mot de passe ?",
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

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Adresse email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="votre.email@exemple.com"
            value={form.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer le code WhatsApp'}
        </Button>

        {/* Back Link */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </form>
    </AuthCard>
  );
}
