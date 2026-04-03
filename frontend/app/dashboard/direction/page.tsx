'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DirectionDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'DIRECTION')) {
      router.replace('/unauthorized');
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

  if (!user || user.role !== 'DIRECTION') {
    return null;
  }

  return (
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tableau de bord Direction
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
              Rendez-vous en attente
            </h3>
            <p className="mt-2 flex items-baseline">
              <span className="text-5xl font-bold text-gray-900">—</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Réclamations
            </h3>
            <p className="mt-2 flex items-baseline">
              <span className="text-5xl font-bold text-gray-900">—</span>
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapports</h3>
            <p className="text-gray-600 mb-4">
              Consultez les rapports détaillés et statistiques
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Voir les rapports
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des utilisateurs</h3>
            <p className="text-gray-600 mb-4">
              Gérez les rôles et permissions des utilisateurs
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Gérer les utilisateurs
            </button>
          </div>
        </div>
      </div>
  );
}
