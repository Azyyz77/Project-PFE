'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, UserPlus, Calendar, Clock, AlertTriangle, Building2 } from 'lucide-react';
import {
  Worker,
  Assignment,
  getWorkersByAgency,
  getAgencyAssignments,
  getAllWorkers,
  getAllAssignments,
} from '@/lib/api/workers';

export default function WorkersManagementPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workers' | 'assignments'>('workers');
  const [selectedAgency, setSelectedAgency] = useState<number | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user) {
      if (isAdmin || user.agence_id) {
        loadData();
      } else {
        setError('Aucune agence associée à votre compte');
        setLoading(false);
      }
    }
  }, [user, selectedAgency]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadWorkers(), loadAssignments()]);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      if (isAdmin) {
        // Admin: charger tous les ouvriers ou filtrer par agence
        const filters = selectedAgency ? { agence_id: selectedAgency } : undefined;
        const data = await getAllWorkers(filters);
        setWorkers(data);
      } else if (user?.agence_id) {
        // Agent: charger uniquement les ouvriers de son agence
        const data = await getWorkersByAgency(user.agence_id);
        setWorkers(data);
      }
    } catch (error) {
      console.error('Erreur chargement ouvriers:', error);
      throw error;
    }
  };

  const loadAssignments = async () => {
    try {
      if (isAdmin) {
        // Admin: charger toutes les affectations ou filtrer par agence
        const filters = selectedAgency ? { agence_id: selectedAgency } : undefined;
        const data = await getAllAssignments(filters);
        setAssignments(data);
      } else if (user?.agence_id) {
        // Agent: charger uniquement les affectations de son agence
        const data = await getAgencyAssignments(user.agence_id);
        setAssignments(data);
      }
    } catch (error) {
      console.error('Erreur chargement affectations:', error);
      // Ne pas throw pour ne pas bloquer le chargement des ouvriers
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800';
      case 'TERMINE':
        return 'bg-green-100 text-green-800';
      case 'ANNULE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'URGENTE':
        return 'bg-red-100 text-red-800';
      case 'HAUTE':
        return 'bg-orange-100 text-orange-800';
      case 'NORMALE':
        return 'bg-blue-100 text-blue-800';
      case 'BASSE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la liste unique des agences (pour le filtre admin)
  const agencies = Array.from(
    new Set(workers.map((w) => JSON.stringify({ id: w.agence_id, nom: w.agence_nom })))
  ).map((str) => JSON.parse(str));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E30613] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Erreur</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8 text-[#E30613]" />
          Gestion des Ouvriers
          {isAdmin && <span className="text-sm font-normal text-gray-500">(Administrateur)</span>}
        </h1>
        <p className="text-gray-600 mt-2">
          {isAdmin
            ? 'Gérez tous les ouvriers et leurs affectations'
            : 'Gérez les ouvriers et leurs affectations'}
        </p>
      </div>

      {/* Filtre par agence (Admin uniquement) */}
      {isAdmin && agencies.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline h-4 w-4 mr-2" />
            Filtrer par agence
          </label>
          <select
            value={selectedAgency || ''}
            onChange={(e) => setSelectedAgency(e.target.value ? Number(e.target.value) : null)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E30613] focus:border-transparent"
          >
            <option value="">Toutes les agences</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workers'
                ? 'border-[#E30613] text-[#E30613]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="inline h-5 w-5 mr-2" />
            Ouvriers ({workers.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-[#E30613] text-[#E30613]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="inline h-5 w-5 mr-2" />
            Affectations ({assignments.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'workers' ? (
        <div>
          {/* Actions */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510] flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Ajouter un ouvrier
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {workers.filter((w) => w.actif).length} ouvrier(s) actif(s)
            </div>
          </div>

          {/* Workers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {worker.prenom} {worker.nom}
                    </h3>
                    <p className="text-sm text-gray-600">{worker.specialite || 'Non spécifié'}</p>
                    {isAdmin && worker.agence_nom && (
                      <p className="text-xs text-gray-500 mt-1">
                        <Building2 className="inline h-3 w-3 mr-1" />
                        {worker.agence_nom}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      worker.actif
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {worker.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Niveau:</span>
                    <span>{worker.niveau_competence || 'Non défini'}</span>
                  </div>
                  {worker.telephone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Tél:</span>
                      <span>{worker.telephone}</span>
                    </div>
                  )}
                  {worker.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Email:</span>
                      <span className="truncate">{worker.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{worker.affectations_en_cours || 0} affectation(s) en cours</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium">
                    Voir détails
                  </button>
                  <button className="flex-1 px-3 py-2 bg-[#E30613] text-white rounded hover:bg-[#C00510] text-sm font-medium">
                    Affecter
                  </button>
                </div>
              </div>
            ))}
          </div>

          {workers.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Aucun ouvrier enregistré</p>
              <p className="text-sm text-gray-500 mb-4">
                {isAdmin
                  ? 'Aucun ouvrier dans le système'
                  : 'Commencez par ajouter des ouvriers à votre agence'}
              </p>
              <button className="px-4 py-2 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510]">
                Ajouter le premier ouvrier
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Assignments List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agence
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ouvrier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client / Véhicule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priorité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment.affectation_id} className="hover:bg-gray-50">
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{assignment.agence_nom}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.ouvrier_prenom} {assignment.ouvrier_nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.ouvrier_specialite}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.client_prenom} {assignment.client_nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.marque} {assignment.modele} - {assignment.immatriculation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                              assignment.priorite
                            )}`}
                          >
                            {assignment.priorite}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              assignment.statut
                            )}`}
                          >
                            {assignment.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.date_affectation).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-[#E30613] hover:text-[#C00510]">
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Aucune affectation</p>
                <p className="text-sm text-gray-500">
                  Les affectations apparaîtront ici une fois créées
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
