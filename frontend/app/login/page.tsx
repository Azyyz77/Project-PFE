'use client';

/**
 * Page de connexion - Refactored with shadcn/ui
 */

import { Suspense, useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthCard } from '@/components/auth/AuthCard';
import { AlertCircle, CheckCircle2, Mail, Lock, LogIn } from 'lucide-react';
import {
  LoginFormState,
  EMPTY_LOGIN_FORM,
  validateLoginForm,
} from '@/lib/auth-utils';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const [form, setForm] = useState<LoginFormState>(EMPTY_LOGIN_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const reset = searchParams.get('reset');

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirectMap: Record<string, string> = {
        CLIENT: '/client/dashboard',
        AGENT: '/dashboard/agent',
        ADMIN: '/dashboard/admin',
        DIRECTION: '/dashboard/direction',
      };
      const redirectUrl = redirectMap[user.role] || '/dashboard';
      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render form if already authenticated (redirect in progress)
  if (isAuthenticated) {
    return null;
  }

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

    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await login(form);
    } catch (err: any) {
      setApiError(err.message || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Connexion"
      subtitle="STA Chery Tunisia - Service d'authentification"
      bottomLink={{
        text: "Pas encore de compte ?",
        href: "/register",
        linkText: "S'inscrire"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Messages */}
        {registered && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">
              ✓ Inscription réussie ! Vous pouvez maintenant vous connecter.
            </p>
          </Alert>
        )}
        {reset && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">
              ✓ Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.
            </p>
          </Alert>
        )}

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
            Email
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

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Mot de passe
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
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

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          size="lg"
        >
          <LogIn className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </form>
    </AuthCard>
  );
}
