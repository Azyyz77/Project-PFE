'use client';

/**
 * Page d'inscription - Refactored with shadcn/ui
 */

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthThemeShell } from '@/components/auth/AuthThemeShell';
import { AlertCircle, CheckCircle2, UserPlus, Users, Mail, Lock, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  RegisterFormState,
  EMPTY_REGISTER_FORM,
  validateRegisterForm,
} from '@/lib/auth-utils';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState<RegisterFormState>(EMPTY_REGISTER_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <AuthThemeShell videoBackground={true} videoOverlayOpacity={0.6}>
        <div className="relative z-10 flex min-h-screen items-center justify-center text-white">
          {t('auth.loginRedirecting')}
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
    setSuccess(false);

    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/registration-success?email=${encodeURIComponent(form.email)}`);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AuthThemeShell videoBackground={true} videoOverlayOpacity={0.6}>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
        {/* Left Section - Outside Form */}
        <section className="hidden flex-1 lg:flex flex-col justify-center pr-12">
          <div className="space-y-6">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-red-400">
                CHERY SERVICE
              </p>
              <h1 className="mt-4 text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                {t('auth.registerTitle').split(' ').slice(0, 2).join(' ')}
                <br />
                <span className="text-red-500">{t('auth.registerTitle').split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="mt-4 text-base text-white/90 max-w-lg leading-relaxed drop-shadow-md">
                {t('auth.registerDesc')}
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
          </div>
        </section>

        {/* Right Section - Form Box */}
        <section className="w-full max-w-md mx-auto lg:mx-0">
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-black via-zinc-950 to-black backdrop-blur-md p-8 shadow-2xl shadow-red-500/20 sm:p-10">
            <div className="flex items-center justify-center gap-4 -mb-2">
              <img src="/chery-logo-clean.png" alt="Chery" className="h-16 w-auto object-contain" />
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-400">
                CHERY SERVICE
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4.5">
              {success && (
                <Alert className="border-emerald-500/50 bg-emerald-950/50 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm">{t('auth.successRegisterRedirect')}</p>
                </Alert>
              )}

              {apiError && (
                <Alert className="border-red-500/50 bg-red-950/50 text-red-300">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm">{apiError}</p>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 h-3.5 w-3.5 text-zinc-500 transition-colors peer-focus:text-red-400 z-10" />
                    <Input
                      id="prenom"
                      name="prenom"
                      type="text"
                      placeholder=" "
                      value={form.prenom}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`peer pl-10 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-transparent focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 ${errors.prenom ? 'border-red-500' : ''}`}
                    />
                    <Label 
                      htmlFor="prenom" 
                      className="absolute left-10 top-3.5 text-zinc-400 text-xs uppercase tracking-wider transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-zinc-400
                      peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-[10px] peer-focus:text-red-400 peer-focus:bg-black peer-focus:px-2
                      peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-zinc-300 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-2"
                    >
                      {t('auth.firstName')}
                    </Label>
                  </div>
                  {errors.prenom && <p className="text-xs text-red-400">{errors.prenom}</p>}
                </div>

                <div className="space-y-2.5">
                  <div className="relative">
                    <Input
                      id="nom"
                      name="nom"
                      type="text"
                      placeholder=" "
                      value={form.nom}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`peer h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-transparent focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 ${errors.nom ? 'border-red-500' : ''}`}
                    />
                    <Label 
                      htmlFor="nom" 
                      className="absolute left-3 top-3.5 text-zinc-400 text-xs uppercase tracking-wider transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-zinc-400
                      peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-[10px] peer-focus:text-red-400 peer-focus:bg-black peer-focus:px-2
                      peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-zinc-300 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-2"
                    >
                      {t('auth.lastName')}
                    </Label>
                  </div>
                  {errors.nom && <p className="text-xs text-red-400">{errors.nom}</p>}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-3.5 w-3.5 text-zinc-500 transition-colors peer-focus:text-red-400 z-10" />
                  <Input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    placeholder=" "
                    value={form.telephone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`peer pl-10 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-transparent focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 ${errors.telephone ? 'border-red-500' : ''}`}
                  />
                  <Label 
                    htmlFor="telephone" 
                    className="absolute left-10 top-3.5 text-zinc-400 text-xs uppercase tracking-wider transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-zinc-400
                    peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-[10px] peer-focus:text-red-400 peer-focus:bg-black peer-focus:px-2
                    peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-zinc-300 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-2"
                  >
                    {t('auth.phone')}
                  </Label>
                </div>
                {errors.telephone && <p className="text-xs text-red-400">{errors.telephone}</p>}
              </div>

              <div className="space-y-2.5">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-3.5 w-3.5 text-zinc-500 transition-colors peer-focus:text-red-400 z-10" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder=" "
                    value={form.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`peer pl-10 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-transparent focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  <Label 
                    htmlFor="email" 
                    className="absolute left-10 top-3.5 text-zinc-400 text-xs uppercase tracking-wider transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-zinc-400
                    peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-[10px] peer-focus:text-red-400 peer-focus:bg-black peer-focus:px-2
                    peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-zinc-300 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-2"
                  >
                    {t('auth.emailLabel')}
                  </Label>
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-3.5 w-3.5 text-zinc-500 transition-colors peer-focus:text-red-400 z-10" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder=" "
                      value={form.password}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`peer pl-10 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-transparent focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <Label 
                      htmlFor="password" 
                      className="absolute left-10 top-3.5 text-zinc-400 text-xs uppercase tracking-wider transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-zinc-400
                      peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-[10px] peer-focus:text-red-400 peer-focus:bg-black peer-focus:px-2
                      peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-zinc-300 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-2"
                    >
                      {t('auth.passwordLabel')}
                    </Label>
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="space-y-2.5">
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder=" "
                      value={form.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`peer h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-transparent focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <Label 
                      htmlFor="confirmPassword" 
                      className="absolute left-3 top-3.5 text-zinc-400 text-xs uppercase tracking-wider transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-zinc-400
                      peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-[10px] peer-focus:text-red-400 peer-focus:bg-black peer-focus:px-2
                      peer-[:not(:placeholder-shown)]:top-[-10px] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-zinc-300 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-2"
                    >
                      {t('auth.confirmPassword')}
                    </Label>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="mt-2 h-12 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg shadow-red-500/30 transition-all duration-200 text-[0.8rem] uppercase tracking-[0.2em] cursor-pointer"
                disabled={isSubmitting || success}
                size="lg"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? t('auth.registering') : t('auth.signUpToChery')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href="/login" className="font-semibold text-red-400 hover:text-red-300 transition-colors underline underline-offset-4">
                {t('auth.loginBtn')}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </AuthThemeShell>
  );
}
