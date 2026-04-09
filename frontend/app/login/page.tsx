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
import { AuthThemeShell } from '@/components/auth/AuthThemeShell';
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { login, isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const reset = searchParams.get('reset');

  // Redirect authenticated users to their dashboard
  // Note: Redirect is now handled in AuthContext.login() using window.location
  // This useEffect is kept for users who refresh the page while already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !isRedirecting) {
      console.log('Login page: User already authenticated on page load', { role: user.role });
      setIsRedirecting(true);
      const redirectMap: Record<string, string> = {
        CLIENT: '/client/dashboard',
        AGENT: '/dashboard/agent',
        ADMIN: '/dashboard/admin',
        DIRECTION: '/dashboard/direction',
      };
      const redirectUrl = redirectMap[user.role] || '/dashboard';
      console.log('Login page: Redirecting to', redirectUrl);
      
      // Use setTimeout to avoid blocking the render
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    }
  }, [isLoading, isAuthenticated, user, isRedirecting]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render form if already authenticated (redirect in progress)
  if (isAuthenticated || isRedirecting) {
    console.log('Login page: Already authenticated, showing redirect message');
    return (
      <AuthThemeShell>
        <div className="relative z-10 flex min-h-screen items-center justify-center text-slate-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
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
    } catch (err: any) {
      setApiError(err.message || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthThemeShell>
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-10">
        <section className="hidden flex-1 pr-10 lg:block">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-slate-300/80">
              <span className="h-px w-14 bg-gradient-to-r from-[#f7454f] to-transparent" />
              Chery Service
            </p>
            <h1 className="max-w-lg text-6xl font-semibold leading-[0.94] text-white">
              REINVENTEZ
              <br />
              VOTRE CONDUITE
            </h1>
            <p className="max-w-md text-base leading-relaxed text-slate-300">
              Accedez a l'ecosysteme precision de Chery Tunisie. Planifiez vos interventions,
              suivez vos rendez-vous et restez connecte a votre garage digital en temps reel.
            </p>

            <div className="flex items-center gap-6 text-[0.66rem] uppercase tracking-[0.32em] text-slate-400/85">
              <span>Modele actuel</span>
              <span className="text-slate-100">Tiggo 8 Pro Max</span>
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl lg:max-w-md">
          <div className="chery-auth-panel rounded-[1.8rem] p-7 sm:p-9">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400">
              CHERY
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Bon retour</h2>
            <p className="mt-2 text-sm text-slate-300/90">
              Entrez vos identifiants pour acceder a votre tableau de bord SAV.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {registered && (
                <Alert className="border-emerald-400/40 bg-emerald-500/10 text-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm">Inscription reussie. Vous pouvez vous connecter.</p>
                </Alert>
              )}
              {reset && (
                <Alert className="border-emerald-400/40 bg-emerald-500/10 text-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm">Mot de passe reinitialise avec succes.</p>
                </Alert>
              )}

              {apiError && (
                <Alert className="border-rose-400/40 bg-rose-500/10 text-rose-100">
                  <AlertCircle className="h-4 w-4 text-rose-300" />
                  <p className="text-sm">{apiError}</p>
                </Alert>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="email" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  <Mail className="h-3.5 w-3.5" />
                  Adresse email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="conducteur@chery-tunisie.com"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`h-12 rounded-xl border-slate-200/10 bg-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/80 ${errors.email ? 'border-rose-400/70' : ''}`}
                />
                {errors.email && <p className="text-xs text-rose-300">{errors.email}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  <Lock className="h-3.5 w-3.5" />
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
                  className={`h-12 rounded-xl border-slate-200/10 bg-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/80 ${errors.password ? 'border-rose-400/70' : ''}`}
                />
                {errors.password && <p className="text-xs text-rose-300">{errors.password}</p>}
              </div>

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#ff6871] transition-colors hover:text-[#ff858d]"
                >
                  Mot de passe oublie ?
                </Link>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl border border-[#ff6a72]/30 bg-gradient-to-r from-[#ff9a9f] to-[#f23f48] text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_14px_30px_rgba(242,63,72,0.35)] hover:brightness-105"
                disabled={isSubmitting}
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-300/85">
              Nouveau chez Chery Service ?{' '}
              <Link href="/register" className="font-semibold text-white underline underline-offset-4">
                S'inscrire
              </Link>
            </p>
          </div>
        </section>
      </main>
    </AuthThemeShell>
  );
}
