'use client';

import { useState, FormEvent, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updateProfile, changePassword } from '@/lib/api/auth';
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

function getRoleLabel(role: string, t: (key: string) => string) {
  switch (role) {
    case 'ADMIN': return t('profile.administrator');
    case 'AGENT': return t('profile.agent');
    case 'DIRECTION': return t('profile.direction');
    default: return t('profile.client');
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
  const { t } = useLanguage();
  const strength = getPasswordStrength(password);
  const strengthMap = {
    weak: { width: '33%', color: 'bg-red-500', label: t('profile.weak') },
    medium: { width: '66%', color: 'bg-orange-500', label: t('profile.medium') },
    strong: { width: '100%', color: 'bg-green-500', label: t('profile.strong') },
  };

  const current = strengthMap[strength];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {t('profile.passwordStrength')}
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
  const { t } = useLanguage();

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#070c14]">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-[#0c1527] dark:via-[#111e35] dark:to-[#0a1120] py-16">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-white/10 dark:bg-[#1c4a9f]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-72 w-72 rounded-full bg-white/10 dark:bg-[#f33e49]/12 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center gap-8 text-white">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl ring-4 ring-white/30 bg-gradient-to-br from-[#f33e49] to-[#ff8a92] text-white text-5xl font-bold shadow-2xl shadow-black/20">
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 border-4 border-white dark:border-[#0c1527] flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">
                {user.prenom} {user.nom}
              </h1>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start items-center mb-4">
                <Badge 
                  variant={getRoleBadgeVariant(user.role)} 
                  className="text-sm px-4 py-1.5 font-semibold uppercase tracking-wider"
                >
                  {getRoleLabel(user.role, t)}
                </Badge>
                <span className="text-white/60 text-sm">•</span>
                <span className="text-white/80 text-sm font-medium">ID: #{user.id}</span>
              </div>
              <div className="space-y-2 text-white/90">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                {user.telephone && (
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{user.telephone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Change Password Card */}
          <Card className="rounded-2xl border border-slate-200 dark:border-white/[0.07] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-xl lg:text-2xl font-bold">{t('profile.accountSecurity')}</CardTitle>
                  <CardDescription className="text-sm lg:text-base">{t('profile.changePasswordRegularly')}</CardDescription>
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
                  {t('profile.currentPassword')} *
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
                  {t('profile.newPassword')} *
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
                  {t('profile.confirmNewPassword')} *
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
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl px-6 py-5 text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                    {t('profile.modifying')}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                    {t('profile.changePassword')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

          {/* Right Column - Edit Profile Card */}
          <Card className="rounded-2xl border border-slate-200 dark:border-white/[0.07] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <User2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl lg:text-2xl font-bold">{t('profile.modifyInfo')}</CardTitle>
                  <CardDescription className="text-sm lg:text-base">{t('profile.updatePersonalInfo')}</CardDescription>
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
                      {t('profile.firstName')} *
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
                      {t('profile.lastName')} *
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
                    {t('profile.notModifiable')}
                  </p>
                </div>

                <Separator className="my-4" />

                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl px-6 py-5 text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                      {t('profile.saving')}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      {t('profile.saveChanges')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
