'use client';

import { Suspense, useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthThemeShell } from '@/components/auth/AuthThemeShell';
import { AlertCircle, CheckCircle2, Mail, Lock, LogIn, CalendarDays } from 'lucide-react';
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { login, isAuthenticated, isLoading, user, logout } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const reset = searchParams.get('reset');
  const phoneVerified = searchParams.get('phone_verified');
  const forceLogout = searchParams.get('logout');

  // Force logout if logout parameter is present
  useEffect(() => {
    if (forceLogout === 'true') {
      localStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.href = '/login';
    }
  }, [forceLogout]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !isRedirecting) {
      setIsRedirecting(true);
      const redirectMap: Record<string, string> = {
        CLIENT: '/client/dashboard',
        AGENT: '/dashboard/agent',
        ADMIN: '/dashboard/admin',
        DIRECTION: '/dashboard/direction',
      };
      const redirectUrl = redirectMap[user.role] || '/dashboard';
      
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    }
  }, [isLoading, isAuthenticated, user, isRedirecting]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated || isRedirecting) {
    return (
      <AuthThemeShell videoBackground={true} videoOverlayOpacity={0.6}>
        <div className="flex min-h-screen items-center justify-center text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
            <p>Redirection vers votre espace...</p>
          </div>
        </div>
      </AuthThemeShell>
    );
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la connexion';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthThemeShell videoBackground={true} videoOverlayOpacity={0.6}>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
        <section className="hidden flex-1 lg:flex flex-col justify-center pr-16">
          <div className="space-y-6">

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
              Gérez vos <br />
              rendez-vous .<br />
            </h1>
            <p className="text-lg text-white/90 max-w-md leading-relaxed drop-shadow-md">
              Planifiez vos interventions, suivez vos rendez-vous et restez connecté à votre espace de service en temps réel avec notre plateforme sécurisée.
            </p>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto lg:mx-0">
          <div className="rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md p-8 shadow-2xl sm:p-10">
            <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez vos identifiants pour accéder à votre espace.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {registered && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm">Inscription réussie. Vous pouvez vous connecter.</p>
                </Alert>
              )}
              {reset && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm">Mot de passe réinitialisé avec succès.</p>
                </Alert>
              )}
              {phoneVerified && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm">Téléphone vérifié avec succès ! Vous pouvez maintenant vous connecter.</p>
                </Alert>
              )}

              {apiError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{apiError}</p>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="exemple@domaine.com"
                    value={form.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`pl-10 h-11 ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary/80"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`pl-10 h-11 ${errors.password ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Vous n'avez pas de compte ?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </section>
      </main>
    </AuthThemeShell>
  );
}
