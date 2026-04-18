'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  vehicleHistoryAPI,
  VehicleHistory,
  VehicleIntervention,
  VehicleAppointment,
} from '@/lib/api/vehicleHistory';
import { Download, Calendar, Wrench, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function VehicleHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = parseInt(params.id as string);

  const [history, setHistory] = useState<VehicleHistory | null>(null);
  const [interventions, setInterventions] = useState<VehicleIntervention[]>([]);
  const [appointments, setAppointments] = useState<VehicleAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'interventions' | 'appointments'>('overview');

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [historyData, interventionsData, appointmentsData] = await Promise.all([
        vehicleHistoryAPI.getHistory(vehicleId),
        vehicleHistoryAPI.getInterventions(vehicleId, { limit: 100 }),
        vehicleHistoryAPI.getAppointments(vehicleId, { limit: 100 }),
      ]);

      setHistory(historyData);
      setInterventions(interventionsData.interventions);
      setAppointments(appointmentsData.appointments);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await vehicleHistoryAPI.exportHistory(vehicleId, 'json');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historique-vehicule-${vehicleId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Erreur lors de l\'export');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-red-600 hover:text-red-800 underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Véhicule non trouvé</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Historique du véhicule
            </h1>
            <p className="text-gray-600 mt-2">
              {history.marque} {history.modele} - {history.immatriculation}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exporter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('interventions')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'interventions'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Interventions ({interventions.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rendez-vous ({appointments.length})
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total RDV</p>
                  <p className="text-2xl font-bold text-gray-900">{history.total_rdv}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Interventions</p>
                  <p className="text-2xl font-bold text-gray-900">{history.total_interventions}</p>
                </div>
                <Wrench className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Coût total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(history.cout_total_interventions)}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Kilométrage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history.kilometrage.toLocaleString()} km
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations du véhicule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Marque et modèle</p>
                <p className="font-medium">{history.marque} {history.modele}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Année</p>
                <p className="font-medium">{history.annee}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Immatriculation</p>
                <p className="font-medium">{history.immatriculation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date d'achat</p>
                <p className="font-medium">{formatDate(history.date_achat)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dernière intervention</p>
                <p className="font-medium">{history.derniere_intervention ? formatDate(history.derniere_intervention) : 'Aucune'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prochain RDV</p>
                <p className="font-medium">{history.prochain_rdv ? formatDate(history.prochain_rdv) : 'Aucun'}</p>
              </div>
            </div>
          </div>

          {/* RDV Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques des rendez-vous</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Terminés</p>
                  <p className="text-xl font-bold">{history.rdv_termines}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Annulés</p>
                  <p className="text-xl font-bold">{history.rdv_annules}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-xl font-bold">
                    {history.total_rdv - history.rdv_termines - history.rdv_annules}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interventions Tab */}
      {activeTab === 'interventions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {interventions.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              Aucune intervention enregistrée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Agence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Coût
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interventions.map((intervention) => (
                    <tr key={intervention.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(intervention.date_intervention)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {intervention.type_intervention || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {intervention.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {intervention.agence_nom || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(intervention.cout_total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          intervention.statut === 'TERMINE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {intervention.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              Aucun rendez-vous enregistré
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Agence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Motif
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(appointment.date_rdv)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.heure_debut} - {appointment.heure_fin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.type_intervention || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.agence_nom || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {appointment.motif || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          appointment.statut === 'TERMINE'
                            ? 'bg-green-100 text-green-800'
                            : appointment.statut === 'ANNULE'
                            ? 'bg-red-100 text-red-800'
                            : appointment.statut === 'CONFIRME'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
