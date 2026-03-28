'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updateProfile, changePassword } from '../../lib/api/auth';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, token, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    telephone: user?.telephone || '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!user || !token) return null;

  const initials = `${user.prenom.charAt(0)}${user.nom.charAt(0) || ''}`.toUpperCase();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'AGENT': return 'Agent SAV';
      case 'DIRECTION': return 'Direction';
      default: return 'Client';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'AGENT': return 'bg-blue-100 text-blue-800';
      case 'DIRECTION': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.prenom.trim() || !profileForm.nom.trim() || !profileForm.telephone.trim()) {
      setProfileError('Tous les champs sont obligatoires.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await updateProfile(user.id, profileForm, token);
      setProfileSuccess('Profil mis à jour avec succès.');
      // Update localStorage with new user data
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = { ...parsed, ...result.user };
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err: any) {
      setProfileError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword, token);
      setPasswordSuccess('Mot de passe modifié avec succès.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Tableau de bord
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mon profil</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Avatar + role section */}
        <section className="rounded-xl bg-white p-6 shadow-lg flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white text-3xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.prenom} {user.nom}
            </h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(user.type_utilisateur)}`}
            >
              {getRoleLabel(user.type_utilisateur)}
            </span>
          </div>
        </section>

        {/* Edit profile */}
        <section className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-5">Modifier les informations</h3>

          {profileError && (
            <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{profileSuccess}</p>
          )}

          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={profileForm.prenom}
                onChange={(e) => setProfileForm((p) => ({ ...p, prenom: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={profileForm.nom}
                onChange={(e) => setProfileForm((p) => ({ ...p, nom: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={profileForm.telephone}
                onChange={(e) => setProfileForm((p) => ({ ...p, telephone: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isSavingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </section>

        {/* Change password */}
        <section className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-5">Changer le mot de passe</h3>

          {passwordError && (
            <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{passwordSuccess}</p>
          )}

          <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60 transition-colors"
              >
                {isSavingPassword ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
