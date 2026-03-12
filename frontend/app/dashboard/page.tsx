'use client';

/**
 * Page Dashboard - Affiche les informations de l'utilisateur connecté
 */

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'AGENT_SAV':
        return 'bg-blue-100 text-blue-800';
      case 'RESPONSABLE_ATELIER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'AGENT_SAV':
        return 'Agent SAV';
      case 'RESPONSABLE_ATELIER':
        return 'Responsable Atelier';
      default:
        return 'Client';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Bienvenue, {user.first_name} {user.last_name} !
              </h2>
              <p className="text-gray-600">
                Vous êtes connecté(e) en tant que {getRoleLabel(user.role)}
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Informations du compte
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                ID
              </label>
              <p className="text-lg text-gray-900">{user.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Rôle
              </label>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Prénom
              </label>
              <p className="text-lg text-gray-900">{user.first_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nom
              </label>
              <p className="text-lg text-gray-900">{user.last_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Téléphone
              </label>
              <p className="text-lg text-gray-900">{user.phone}</p>
            </div>

            {user.created_at && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Membre depuis
                </label>
                <p className="text-lg text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {user.is_active !== undefined && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Statut du compte
                </label>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? '✓ Actif' : '✗ Inactif'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Profil</h4>
                <p className="text-sm text-gray-600">Modifier vos informations</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Services</h4>
                <p className="text-sm text-gray-600">Accéder aux services</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Paramètres</h4>
                <p className="text-sm text-gray-600">Gérer votre compte</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
