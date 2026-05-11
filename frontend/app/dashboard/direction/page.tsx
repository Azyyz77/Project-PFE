'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  getGlobalStats, 
  getAgencyStats, 
  getRevenueStats, 
  getSatisfactionStats 
} from '@/lib/api/directionStats';

export default function DirectionDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // États pour les statistiques
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'DIRECTION')) {
      router.replace('/unauthorized');
    }
  }, [user, isLoading, router]);

  // Charger les statistiques
  useEffect(() => {
    if (user && user.role === 'DIRECTION') {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger toutes les statistiques en parallèle
      const [globalData, agencyData, revenueData, satisfactionData] = await Promise.all([
        getGlobalStats(),
        getAgencyStats(),
        getRevenueStats(),
        getSatisfactionStats()
      ]);

      setStats({
        global: globalData,
        agencies: agencyData,
        revenue: revenueData,
        satisfaction: satisfactionData
      });
    } catch (err: any) {
      console.error('Erreur chargement stats dashboard:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'DIRECTION') {
    return null;
  }

  // Afficher l'erreur si présente
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Erreur</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadDashboardStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const globalStats = stats?.global?.global || {};
  const revenueGlobal = stats?.revenue?.global || {};
  const satisfactionGlobal = stats?.satisfaction?.satisfaction || {};
  const topAgencies = stats?.agencies?.slice(0, 5) || [];

  return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tableau de bord Direction
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user.prenom} {user.nom} - Vue d'ensemble de l'activité
          </p>
        </div>

        {/* KPIs Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Rendez-vous */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">
                Rendez-vous
              </h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">
              {globalStats.total_rdv || 0}
            </p>
            <p className="text-sm opacity-90">
              {globalStats.rdv_termines || 0} terminés • {globalStats.rdv_en_attente || 0} en attente
            </p>
          </div>

          {/* Revenus */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">
                Revenus
              </h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">
              {(revenueGlobal.revenu_total || 0).toLocaleString('fr-FR')} €
            </p>
            <p className="text-sm opacity-90">
              {revenueGlobal.total_factures || 0} factures • Moy: {(revenueGlobal.revenu_moyen || 0).toFixed(0)} €
            </p>
          </div>

          {/* Satisfaction */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">
                Satisfaction
              </h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">
              {(satisfactionGlobal.taux_satisfaction || 0).toFixed(1)}%
            </p>
            <p className="text-sm opacity-90">
              Note: {(satisfactionGlobal.note_moyenne || 0).toFixed(2)}/5 • {satisfactionGlobal.total_feedbacks || 0} avis
            </p>
          </div>

          {/* Agences */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">
                Agences
              </h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">
              {globalStats.total_agences || 0}
            </p>
            <p className="text-sm opacity-90">
              {topAgencies.length} actives
            </p>
          </div>
        </div>

        {/* Top Agences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Top 5 Agences - Performance
            </h2>
            <div className="space-y-3">
              {topAgencies.map((agency: any, index: number) => (
                <div key={agency.agence_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{agency.agence_nom}</p>
                      <p className="text-sm text-gray-500">{agency.ville}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{agency.total_rdv} RDV</p>
                    <p className="text-sm text-green-600">{agency.taux_completion?.toFixed(0)}% complétés</p>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/dashboard/direction/agencies"
              className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Voir toutes les agences
            </Link>
          </div>

          {/* Statistiques Rapides */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Statistiques Rapides
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Taux de complétion</span>
                <span className="font-bold text-blue-600">
                  {globalStats.total_rdv > 0 
                    ? ((globalStats.rdv_termines / globalStats.total_rdv) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Revenu moyen/facture</span>
                <span className="font-bold text-green-600">
                  {(revenueGlobal.revenu_moyen || 0).toFixed(0)} €
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Feedbacks positifs</span>
                <span className="font-bold text-purple-600">
                  {satisfactionGlobal.feedbacks_positifs || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-700">Durée moyenne RDV</span>
                <span className="font-bold text-orange-600">
                  {globalStats.duree_moyenne_min || 0} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation rapide */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            href="/dashboard/direction/statistics"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
              <svg className="w-6 h-6 text-blue-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">
              Consultez les statistiques détaillées et les tendances
            </p>
          </Link>

          <Link 
            href="/dashboard/direction/agencies"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Agences</h3>
              <svg className="w-6 h-6 text-orange-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">
              Gérez et analysez la performance des agences
            </p>
          </Link>

          <Link 
            href="/dashboard/direction/reports"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Rapports</h3>
              <svg className="w-6 h-6 text-green-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">
              Générez et exportez des rapports détaillés
            </p>
          </Link>

          <Link 
            href="/dashboard/direction/staff"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Personnel</h3>
              <svg className="w-6 h-6 text-purple-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">
              Suivez la performance du personnel
            </p>
          </Link>
        </div>
      </div>
  );
}
