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
import { AuthCard } from '@/components/auth/AuthCard';
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
    <AuthCard
      title="Inscription"
      subtitle="Créez votre compte STA Chery Tunisia"
      bottomLink={{
        text: "Vous avez déjà un compte ?",
        href: "/login",
        linkText: "Se connecter"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">
              ✓ Inscription réussie ! Redirection vers la connexion...
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

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prenom" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Prénom
            </Label>
            <Input
              id="prenom"
              name="prenom"
              type="text"
              placeholder="Ahmed"
              value={form.prenom}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={errors.prenom ? 'border-red-500' : ''}
            />
            {errors.prenom && (
              <p className="text-xs text-red-600">{errors.prenom}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              name="nom"
              type="text"
              placeholder="Ben Ali"
              value={form.nom}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={errors.nom ? 'border-red-500' : ''}
            />
            {errors.nom && (
              <p className="text-xs text-red-600">{errors.nom}</p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="space-y-2">
          <Label htmlFor="telephone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Téléphone
          </Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            placeholder="+216 12 345 678"
            value={form.telephone}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.telephone ? 'border-red-500' : ''}
          />
          {errors.telephone && (
            <p className="text-xs text-red-600">{errors.telephone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jean.dupont@exemple.com"
            value={form.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Fields */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
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
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password}</p>
          )}
        </div>

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
          disabled={isSubmitting || success}
          size="lg"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
        </Button>
      </form>
    </AuthCard>
  );
}
