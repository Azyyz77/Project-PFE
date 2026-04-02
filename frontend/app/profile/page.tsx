'use client';

import { useState, FormEvent, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updateProfile, changePassword } from '../../lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  Lock,
  User2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { validateProfileForm } from '@/lib/auth-utils';
import { toast } from 'sonner';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'ADMIN': return 'Administrateur';
    case 'AGENT': return 'Agent SAV';
    case 'DIRECTION': return 'Direction';
    default: return 'Client';
  }
}

function getRoleBadgeVariant(role: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (role) {
    case 'ADMIN': return 'destructive';
    case 'AGENT': return 'default';
    case 'DIRECTION': return 'secondary';
    default: return 'outline';
  }
}

function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password) return 'weak';
  if (password.length < 6) return 'weak';
  if (password.length < 10) return 'medium';
  const hasNumber = /\d/.test(password);
  if (hasNumber) return 'strong';
  return 'medium';
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const strengthMap = {
    weak: { width: '33%', color: 'bg-red-500', label: 'Faible' },
    medium: { width: '66%', color: 'bg-orange-500', label: 'Moyen' },
    strong: { width: '100%', color: 'bg-green-500', label: 'Fort' },
  };

  const current = strengthMap[strength];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Force du mot de passe
        </span>
        <span className={`text-xs font-semibold ${
          strength === 'strong'
            ? 'text-green-600'
            : strength === 'medium'
            ? 'text-orange-600'
            : 'text-red-600'
        }`}>
          {current.label}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${current.color}`}
          style={{ width: current.width }}
        />
      </div>
    </div>
  );
}

function ProfileContent() {
  const { user, token } = useAuth();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    telephone: user?.telephone || '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  if (!user || !token) return null;

  const initials = `${user.prenom.charAt(0)}${user.nom.charAt(0) || ''}`.toUpperCase();

  const handleProfileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [profileErrors]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileErrors({});

    const validationErrors = validateProfileForm(profileForm);
    if (Object.keys(validationErrors).length > 0) {
      setProfileErrors(validationErrors);
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await updateProfile(user.id, profileForm, token);
      toast.success('Profil mis à jour avec succès.');
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = { ...parsed, ...result.user };
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err: any) {
      const msg = err.message || 'Erreur lors de la mise à jour';
      setProfileError(msg);
      toast.error('Erreur', { description: msg });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((p) => ({ ...p, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordErrors({});

    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est obligatoire';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est obligatoire';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword, token);
      toast.success('Mot de passe modifié avec succès.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPassword({ current: false, new: false, confirm: false });
    } catch (err: any) {
      const msg = err.message || 'Erreur lors du changement de mot de passe';
      setPasswordError(msg);
      toast.error('Erreur', { description: msg });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 py-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 size-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-white">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="flex h-28 w-28 items-center justify-center rounded-full ring-4 ring-white/30 bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-5xl font-bold shadow-lg">
                {initials}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {user.prenom} {user.nom}
              </h1>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center mb-3">
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-base px-3 py-1">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              <div className="space-y-1 text-blue-100">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.telephone && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{user.telephone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Edit Profile Card */}
        <Card className="rounded-2xl border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-xl">Modifier les informations</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {profileError && (
              <Alert variant="destructive" className="mb-4 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Prénom */}
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-sm font-medium">
                    Prénom *
                  </Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={profileForm.prenom}
                    onChange={handleProfileInputChange}
                    disabled={isSavingProfile}
                    className={`rounded-lg ${
                      profileErrors.prenom ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                    placeholder="Votre prénom"
                  />
                  {profileErrors.prenom && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {profileErrors.prenom}
                    </p>
                  )}
                </div>

                {/* Nom */}
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-medium">
                    Nom *
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    type="text"
                    value={profileForm.nom}
                    onChange={handleProfileInputChange}
                    disabled={isSavingProfile}
                    className={`rounded-lg ${
                      profileErrors.nom ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                    placeholder="Votre nom"
                  />
                  {profileErrors.nom && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {profileErrors.nom}
                    </p>
                  )}
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={profileForm.telephone}
                  onChange={handleProfileInputChange}
                  disabled={isSavingProfile}
                  className={`rounded-lg pl-10 ${
                    profileErrors.telephone
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  placeholder="+216 XX XXX XXX"
                />
                {profileErrors.telephone && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {profileErrors.telephone}
                  </p>
                )}
              </div>

              {/* Email (disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-slate-50 dark:bg-slate-900/30 cursor-not-allowed opacity-60 pl-10 rounded-lg"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Non modifiable
                </p>
              </div>

              <Separator className="my-4" />

              <Button
                type="submit"
                disabled={isSavingProfile}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="rounded-2xl border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <CardTitle className="text-xl">Sécurité du compte</CardTitle>
                <CardDescription>Modifiez votre mot de passe régulièrement</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {passwordError && (
              <Alert variant="destructive" className="mb-4 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Mot de passe actuel *
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword.current ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isSavingPassword}
                    className={`rounded-lg pr-10 ${
                      passwordErrors.currentPassword
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((p) => ({ ...p, current: !p.current }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  Nouveau mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword.new ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isSavingPassword}
                    className={`rounded-lg pr-10 ${
                      passwordErrors.newPassword
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((p) => ({ ...p, new: !p.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {passwordErrors.newPassword}
                  </p>
                )}

                {passwordForm.newPassword && (
                  <PasswordStrengthIndicator password={passwordForm.newPassword} />
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmer le nouveau mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword.confirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isSavingPassword}
                    className={`rounded-lg pr-10 ${
                      passwordErrors.confirmPassword
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((p) => ({ ...p, confirm: !p.confirm }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <Button
                type="submit"
                disabled={isSavingPassword}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Modifier le mot de passe
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
