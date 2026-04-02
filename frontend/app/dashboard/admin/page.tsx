'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Tableau de bord Administrateur
            </h1>
            <p className="text-gray-600">
              Bienvenue, {user.prenom} {user.nom}
            </p>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Utilisateurs actifs
              </h3>
              <p className="mt-2 flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">—</span>
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Véhicules en attente
              </h3>
              <p className="mt-2 flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">—</span>
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Réclamations non traitées
              </h3>
              <p className="mt-2 flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">—</span>
              </p>
            </div>
          </div>

          {/* Admin Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Gestion des utilisateurs</h2>
              <p className="text-gray-600 mb-4">
                Gérez les rôles, les permissions et les comptes utilisateurs.
              </p>
              <button disabled className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-not-allowed opacity-50">
                Bientôt disponible
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rapports et analyses</h2>
              <p className="text-gray-600 mb-4">
                Consultez les statistiques et les rapports du système.
              </p>
              <button disabled className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-not-allowed opacity-50">
                Bientôt disponible
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Configuration système</h2>
              <p className="text-gray-600 mb-4">
                Configurez les paramètres globaux du système.
              </p>
              <button disabled className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-not-allowed opacity-50">
                Bientôt disponible
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Logs d'audit</h2>
              <p className="text-gray-600 mb-4">
                Consultez l'historique des actions du système.
              </p>
              <button disabled className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-not-allowed opacity-50">
                Bientôt disponible
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Mes informations</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Téléphone</p>
                <p className="font-medium text-gray-900">{user.telephone || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-gray-600">Rôle</p>
                <p className="font-medium text-gray-900">{user.role}</p>
              </div>
              <div>
                <p className="text-gray-600">Créé le</p>
                <p className="font-medium text-gray-900">
                  {user.date_creation 
                    ? new Date(user.date_creation).toLocaleDateString('fr-FR')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
