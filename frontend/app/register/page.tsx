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
import {
  RegisterFormState,
  EMPTY_REGISTER_FORM,
  validateRegisterForm,
} from '@/lib/auth-utils';

export default function RegisterPage() {
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
      <AuthThemeShell sceneClassName="chery-auth-scene chery-auth-scene-register">
        <div className="relative z-10 flex min-h-screen items-center justify-center text-slate-700">
          Redirection vers votre espace...
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
    <AuthThemeShell sceneClassName="chery-auth-scene chery-auth-scene-register">
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-10">
        <section className="w-full max-w-xl lg:max-w-lg">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-7 shadow-[0_28px_70px_rgba(15,23,42,0.14)] sm:p-9">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
              CHERY SERVICE
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-[2.55rem]">
              Creez votre
              <br />
              garage digital
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Rejoignez l&apos;univers du service precision et creez votre profil SAV.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4.5">
              {success && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm">Inscription reussie. Redirection vers la connexion.</p>
                </Alert>
              )}

              {apiError && (
                <Alert className="border-rose-200 bg-rose-50 text-rose-900">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <p className="text-sm">{apiError}</p>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="prenom" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                    <Users className="h-3.5 w-3.5" />
                    Prenom
                  </Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    type="text"
                    placeholder="Ahmed"
                    value={form.prenom}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`h-12 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 ${errors.prenom ? 'border-rose-300' : 'border-slate-200'}`}
                  />
                  {errors.prenom && <p className="text-xs text-rose-600">{errors.prenom}</p>}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="nom" className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    type="text"
                    placeholder="Ben Ali"
                    value={form.nom}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`h-12 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 ${errors.nom ? 'border-rose-300' : 'border-slate-200'}`}
                  />
                  {errors.nom && <p className="text-xs text-rose-600">{errors.nom}</p>}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="telephone" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                  <Phone className="h-3.5 w-3.5" />
                  Telephone
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  placeholder="+216 12 345 678"
                  value={form.telephone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`h-12 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 ${errors.telephone ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {errors.telephone && <p className="text-xs text-rose-600">{errors.telephone}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="email" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                  <Mail className="h-3.5 w-3.5" />
                  Adresse email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="precision@chery.com"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`h-12 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 ${errors.email ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="password" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                    <Lock className="h-3.5 w-3.5" />
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`h-12 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 ${errors.password ? 'border-rose-300' : 'border-slate-200'}`}
                  />
                  {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="confirmPassword" className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                    Confirmation
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`h-12 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 ${errors.confirmPassword ? 'border-rose-300' : 'border-slate-200'}`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-rose-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="mt-2 h-12 w-full bg-slate-900 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-800"
                disabled={isSubmitting || success}
                size="lg"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire a Chery Service'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Vous avez deja un compte ?{' '}
              <Link href="/login" className="font-semibold text-slate-900 underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </div>
        </section>
      </main>
    </AuthThemeShell>
  );
}
