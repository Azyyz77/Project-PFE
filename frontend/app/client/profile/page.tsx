'use client';

import { useState, FormEvent, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updateProfile, changePassword } from '@/lib/api/auth';
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientLoadingState,
} from '@/components/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  User,
  Shield,
  Key,
  Camera,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { validateProfileForm } from '@/lib/auth-utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
    medium: { width: '66%', color: 'bg-amber-500', label: t('profile.medium') },
    strong: { width: '100%', color: 'bg-emerald-500', label: t('profile.strong') },
  };

  const current = strengthMap[strength];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {t('profile.passwordStrength')}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${
          strength === 'strong'
            ? 'text-emerald-500'
            : strength === 'medium'
            ? 'text-amber-500'
            : 'text-red-500'
        }`}>
          {current.label}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: current.width }}
          className={`h-full transition-all duration-500 ${current.color}`}
        />
      </div>
    </div>
  );
}

function ProfileContent() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [profileForm, setProfileForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    telephone: user?.telephone || '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  if (!user || !token) return <ClientLoadingState />;

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
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-red-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          {/* Profile Picture / Initials */}
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-32 w-32 sm:h-40 sm:w-40 rounded-[2.5rem] bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-5xl sm:text-6xl font-black text-white shadow-2xl shadow-red-500/20 border-4 border-white/10"
            >
              {initials}
            </motion.div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Camera className="h-5 w-5 text-slate-800" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md border border-white/10">
              <Shield className="h-3.5 w-3.5" />
              Compte Sécurisé
            </div>
            <h1 className="mb-2 text-4xl sm:text-5xl font-black tracking-tight leading-none">
              {user.prenom} <span className="text-red-500">{user.nom}</span>
            </h1>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 border border-slate-700 rounded-full px-4 py-1.5">
                {getRoleLabel(user.role, t)}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID: #{user.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto md:mx-0">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                <Mail className="h-4 w-4 text-red-500" />
                <span className="text-sm font-bold text-slate-300 truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                <Phone className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-bold text-slate-300">{user.telephone || 'Non renseigné'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Forms Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ClientCard className="h-full">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <User2 className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t('profile.modifyInfo')}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('profile.updatePersonalInfo')}</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {profileError && (
                <Alert className="bg-red-50 border-red-100 text-red-600 rounded-2xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-bold">{profileError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    {t('profile.firstName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="prenom"
                    value={profileForm.prenom}
                    onChange={handleProfileInputChange}
                    disabled={isSavingProfile}
                    className="rounded-2xl bg-slate-50 border-slate-100 py-6 px-5 font-medium focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    {t('profile.lastName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="nom"
                    value={profileForm.nom}
                    onChange={handleProfileInputChange}
                    disabled={isSavingProfile}
                    className="rounded-2xl bg-slate-50 border-slate-100 py-6 px-5 font-medium focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  {t('common.phone')}
                </Label>
                <Input
                  name="telephone"
                  value={profileForm.telephone}
                  onChange={handleProfileInputChange}
                  disabled={isSavingProfile}
                  placeholder="+216 XX XXX XXX"
                  className="rounded-2xl bg-slate-50 border-slate-100 py-6 px-5 font-medium focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    value={user.email}
                    disabled
                    className="rounded-2xl bg-slate-100 border-slate-200 py-6 px-5 font-bold text-slate-400 opacity-70 cursor-not-allowed"
                  />
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 italic">L'adresse email ne peut pas être modifiée.</p>
              </div>

              <div className="pt-4">
                <ClientButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="large"
                  disabled={isSavingProfile}
                  icon={isSavingProfile ? undefined : CheckCircle2}
                >
                  {isSavingProfile ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('profile.saving')}
                    </span>
                  ) : (
                    t('profile.saveChanges')
                  )}
                </ClientButton>
              </div>
            </form>
          </ClientCard>
        </motion.div>

        {/* Password Management */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ClientCard className="h-full border-2 border-red-50">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <Key className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t('profile.accountSecurity')}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('profile.changePasswordRegularly')}</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {passwordError && (
                <Alert className="bg-red-50 border-red-100 text-red-600 rounded-2xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-bold">{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  {t('profile.currentPassword')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="currentPassword"
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isSavingPassword}
                    className="rounded-2xl bg-slate-50 border-slate-100 py-6 px-5 font-medium focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Separator className="my-2 bg-slate-100" />

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  {t('profile.newPassword')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="newPassword"
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isSavingPassword}
                    className="rounded-2xl bg-slate-50 border-slate-100 py-6 px-5 font-medium focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <PasswordStrengthIndicator password={passwordForm.newPassword} />
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  {t('profile.confirmNewPassword')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isSavingPassword}
                    className="rounded-2xl bg-slate-50 border-slate-100 py-6 px-5 font-medium focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <ClientButton
                  type="submit"
                  variant="secondary"
                  fullWidth
                  size="large"
                  disabled={isSavingPassword}
                  icon={isSavingPassword ? undefined : Lock}
                >
                  {isSavingPassword ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('profile.modifying')}
                    </span>
                  ) : (
                    t('profile.changePassword')
                  )}
                </ClientButton>
              </div>
            </form>
          </ClientCard>
        </motion.div>
      </div>
    </ClientPageWrapper>
  );
}
