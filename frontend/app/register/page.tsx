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
import { CheryVideoBackground } from '@/components/auth/CheryVideoBackground';
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
      <div className="chery-auth-scene chery-auth-scene-register">
        <CheryVideoBackground />
        <div className="chery-auth-ambient" />
        <div className="chery-auth-grid" />
        <div className="relative z-10 flex min-h-screen items-center justify-center text-slate-100">
          Redirection vers votre espace...
        </div>
      </div>
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
        router.push('/login?registered=true');
      }, 1500);
    } catch (err: any) {
      setApiError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="chery-auth-scene chery-auth-scene-register">
      <CheryVideoBackground />
      <div className="chery-auth-ambient" />
      <div className="chery-auth-grid" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-10">
        <section className="w-full max-w-xl lg:max-w-lg">
          <div className="chery-auth-panel rounded-[1.8rem] p-7 sm:p-9">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400">
              CHERY SERVICE
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-[2.55rem]">
              Creez votre
              <br />
              garage digital
            </h1>
            <p className="mt-2 text-sm text-slate-300/90">
              Rejoignez l'univers du service precision et creez votre profil SAV.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4.5">
              {success && (
                <Alert className="border-emerald-400/40 bg-emerald-500/10 text-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm">Inscription reussie. Redirection vers la connexion.</p>
                </Alert>
              )}

              {apiError && (
                <Alert className="border-rose-400/40 bg-rose-500/10 text-rose-100">
                  <AlertCircle className="h-4 w-4 text-rose-300" />
                  <p className="text-sm">{apiError}</p>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="prenom" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
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
                    className={`h-12 rounded-xl border-slate-200/10 bg-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/80 ${errors.prenom ? 'border-rose-400/70' : ''}`}
                  />
                  {errors.prenom && <p className="text-xs text-rose-300">{errors.prenom}</p>}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="nom" className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
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
                    className={`h-12 rounded-xl border-slate-200/10 bg-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/80 ${errors.nom ? 'border-rose-400/70' : ''}`}
                  />
                  {errors.nom && <p className="text-xs text-rose-300">{errors.nom}</p>}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="telephone" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
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
                  className={`h-12 rounded-xl border-slate-200/10 bg-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/80 ${errors.telephone ? 'border-rose-400/70' : ''}`}
                />
                {errors.telephone && <p className="text-xs text-rose-300">{errors.telephone}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="email" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
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
                  className={`h-12 rounded-xl border-slate-200/10 bg-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/80 ${errors.email ? 'border-rose-400/70' : ''}`}
                />
                {errors.email && <p className="text-xs text-rose-300">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="password" className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
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
                    className={`h-12 rounded-xl border-slate-200/10 bg-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/80 ${errors.password ? 'border-rose-400/70' : ''}`}
                  />
                  {errors.password && <p className="text-xs text-rose-300">{errors.password}</p>}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="confirmPassword" className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
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
                    className={`h-12 rounded-xl border-slate-200/10 bg-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/80 ${errors.confirmPassword ? 'border-rose-400/70' : ''}`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-rose-300">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-xl border border-[#ff6a72]/30 bg-gradient-to-r from-[#ff9a9f] to-[#f23f48] text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_14px_30px_rgba(242,63,72,0.35)] hover:brightness-105"
                disabled={isSubmitting || success}
                size="lg"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Inscription en cours...' : "S'inscrire a Chery Service"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-300/85">
              Vous avez deja un compte ?{' '}
              <Link href="/login" className="font-semibold text-white underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
