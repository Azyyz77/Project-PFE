'use client';

import { useState, useEffect } from 'react';
import { statusesAPI, Status, StatusType, StatusWithUsage } from '@/lib/api/statuses';

const STATUS_TYPES: { value: StatusType; label: string; description: string }[] = [
  { value: 'rdv', label: 'Rendez-vous', description: 'Statuts des rendez-vous clients' },
  { value: 'intervention', label: 'Interventions', description: 'Statuts des interventions techniques' },
  { value: 'reclamation', label: 'Réclamations', description: 'Statuts des réclamations clients' }
];

export default function StatusesPage() {
  const [activeTab, setActiveTab] = useState<StatusType>('rdv');
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [stats, setStats] = useState<StatusWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulaire d'ajout
  const [newStatus, setNewStatus] = useState({
    code: '',
    libelle: ''
  });

  // Formulaire d'édition
  const [editStatus, setEditStatus] = useState<Status | null>(null);

  useEffect(() => {
    loadStatuses();
  }, [activeTab]);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await statusesAPI.getByType(activeTab);
      setStatuses(data.statuses);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await statusesAPI.getStats(activeTab);
      setStats(data.stats);
      setShowStatsModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des statistiques');
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newStatus.code || !newStatus.libelle) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      await statusesAPI.create(activeTab, newStatus);
      setSuccess('Statut créé avec succès');
      setShowAddModal(false);
      setNewStatus({ code: '', libelle: '' });
      loadStatuses();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleEditStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editStatus || !editStatus.libelle) {
      setError('Le libellé est requis');
      return;
    }

    try {
      await statusesAPI.update(activeTab, editStatus.code, editStatus.libelle);
      setSuccess('Statut mis à jour avec succès');
      setShowEditModal(false);
      setEditStatus(null);
      loadStatuses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteStatus = async (code: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le statut "${code}" ?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await statusesAPI.delete(activeTab, code);
      setSuccess('Statut supprimé avec succès');
      loadStatuses();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const openEditModal = (status: Status) => {
    setEditStatus({ ...status });
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Statuts</h1>
        <p className="text-gray-600 mt-2">
          Gérez les statuts dynamiques pour les rendez-vous, interventions et réclamations
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {STATUS_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveTab(type.value)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === type.value
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Tab Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {STATUS_TYPES.find(t => t.value === activeTab)?.label}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {STATUS_TYPES.find(t => t.value === activeTab)?.description}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Statistiques
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              + Ajouter un statut
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : statuses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <p className="text-gray-600">Aucun statut trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Libellé
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statuses.map((status) => (
                  <tr key={status.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-mono font-semibold bg-gray-100 text-gray-800 rounded">
                        {status.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{status.libelle}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(status)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteStatus(status.code)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Ajouter un statut</h2>

            <form onSubmit={handleAddStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={newStatus.code}
                  onChange={(e) => setNewStatus({ ...newStatus, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono"
                  placeholder="EN_ATTENTE"
                  pattern="[A-Z_]+"
                  title="Majuscules et underscores uniquement"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Majuscules et underscores uniquement (ex: EN_COURS)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Libellé *
                </label>
                <input
                  type="text"
                  value={newStatus.libelle}
                  onChange={(e) => setNewStatus({ ...newStatus, libelle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="En attente"
                  maxLength={50}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewStatus({ code: '', libelle: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && editStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Modifier le statut</h2>

            <form onSubmit={handleEditStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={editStatus.code}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le code ne peut pas être modifié
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Libellé *
                </label>
                <input
                  type="text"
                  value={editStatus.libelle}
                  onChange={(e) => setEditStatus({ ...editStatus, libelle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  maxLength={50}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Mettre à jour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditStatus(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de statistiques */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Statistiques d'utilisation</h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.code} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="px-2 py-1 text-xs font-mono font-semibold bg-gray-100 text-gray-800 rounded">
                        {stat.code}
                      </span>
                      <span className="ml-2 text-sm text-gray-900">{stat.libelle}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stat.usage_count}</div>
                      <div className="text-xs text-gray-500">{stat.percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
