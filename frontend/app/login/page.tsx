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
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
            <p>{t('auth.loginRedirecting')}</p>
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
        <section className="hidden flex-1 lg:flex flex-col justify-center pr-12">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                {t('auth.welcomeTitle').split('SAV')[0]} <br />
                <span className="text-red-500">SAV {t('auth.welcomeTitle').split('SAV')[1] || ''}</span>
              </h1>
              <p className="mt-4 text-base text-white/90 max-w-lg leading-relaxed drop-shadow-md">
                {t('auth.welcomeDesc')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-emerald-400/60 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm">{t('auth.featureAppointments')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-emerald-400/60 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm">{t('auth.featureTracking')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-emerald-400/60 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm">{t('auth.featureHistory')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-emerald-400/60 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm">{t('auth.featureDiagnostics')}</p>
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div>
                <div className="text-3xl font-bold text-white">12K+</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-0.5">{t('auth.statClients')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">48K+</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-0.5">{t('auth.statAppointments')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-0.5">{t('auth.statSatisfaction')}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto lg:mx-0">
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-black via-zinc-950 to-black backdrop-blur-md p-8 shadow-2xl shadow-red-500/20 sm:p-10">
            <h2 className="text-2xl font-bold text-white">{t('auth.loginTitle')}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {t('auth.loginDesc')}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {registered && (
                <Alert className="border-emerald-500/50 bg-emerald-950/50 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm">{t('auth.successRegister')}</p>
                </Alert>
              )}
              {reset && (
                <Alert className="border-emerald-500/50 bg-emerald-950/50 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm">{t('auth.successPasswordReset')}</p>
                </Alert>
              )}
              {phoneVerified && (
                <Alert className="border-emerald-500/50 bg-emerald-950/50 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm">{t('auth.successPhoneVerified')}</p>
                </Alert>
              )}

              {apiError && (
                <Alert className="border-red-500/50 bg-red-950/50 text-red-300">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm">{apiError}</p>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500 transition-colors peer-focus:text-red-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder=" "
                    value={form.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`peer pl-10 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-transparent focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  <Label 
                    htmlFor="email" 
                    className="absolute left-10 top-3.5 text-zinc-400 text-sm transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400
                    peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-xs peer-focus:text-red-400 peer-focus:bg-black peer-focus:px-2
                    peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-zinc-300 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-2"
                  >
                    {t('auth.emailLabel')}
                  </Label>
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div></div>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    {t('auth.forgotPasswordBtn')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500 transition-colors peer-focus:text-red-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder=" "
                    value={form.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`peer pl-10 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-transparent focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Label 
                    htmlFor="password" 
                    className="absolute left-10 top-3.5 text-zinc-400 text-sm transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400
                    peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-xs peer-focus:text-red-400 peer-focus:bg-black peer-focus:px-2
                    peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-zinc-300 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-2"
                  >
                    {t('auth.passwordLabel')}
                  </Label>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg shadow-red-500/30 transition-all duration-200 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('auth.loggingIn') : t('auth.loginBtn')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-400">
              {t('auth.noAccount')}{' '}
              <Link href="/register" className="font-semibold text-red-400 hover:text-red-300 transition-colors">
                {t('auth.registerBtn')}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </AuthThemeShell>
  );
}
