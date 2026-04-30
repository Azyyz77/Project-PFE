'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Plus, Search, Filter, Building2,
  CheckCircle, AlertTriangle, RefreshCw, FileText
} from 'lucide-react';
import {
  Worker,
  getAllWorkers
} from '@/lib/api/workers';
import WorkerCard from '@/components/admin/WorkerCard';
import WorkerModal from '@/components/admin/WorkerModal';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Agency {
  id: number;
  nom: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminWorkersPage() {
  const { user } = useAuth();

  // State
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [specialiteFilter, setSpecialiteFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadWorkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (statusFilter === 'active') filters.actif = true;
      if (statusFilter === 'inactive') filters.actif = false;
      if (selectedAgency) filters.agence_id = selectedAgency;
      if (specialiteFilter) filters.specialite = specialiteFilter;

      const data = await getAllWorkers(filters);
      setWorkers(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedAgency, specialiteFilter]);

  // Load agencies (mock data for now)
  useEffect(() => {
    // In a real app, you'd fetch this from an API
    setAgencies([
      { id: 1, nom: 'STA Tunis Nord' },
      { id: 2, nom: 'STA Tunis Sud' },
      { id: 3, nom: 'STA Sfax' },
      { id: 4, nom: 'STA Sousse' }
    ]);
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingWorker(null);
    setShowModal(true);
  };

  const openEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingWorker(null);
  };

  const handleSuccess = async (message: string) => {
    setSuccessMsg(message);
    await loadWorkers();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(''), 5000);
  };

  // ── Filter workers ──────────────────────────────────────────────────────────
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = searchTerm === '' || 
      `${worker.prenom} ${worker.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.specialite?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get unique specialites for filter
  const specialites = Array.from(new Set(workers.map(w => w.specialite).filter(Boolean)));

  // Statistics
  const stats = {
    total: filteredWorkers.length,
    active: filteredWorkers.filter(w => w.actif).length,
    inactive: filteredWorkers.filter(w => !w.actif).length,
    totalAssignments: filteredWorkers.reduce((sum, w) => sum + (w.affectations_en_cours || 0), 0)
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading && workers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Chargement des ouvriers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestion des Ouvriers</h1>
                <p className="text-slate-600">Créer, modifier et gérer tous les techniciens</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Statistics */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {stats.total} ouvriers
                </div>
                <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  {stats.active} actifs
                </div>
                <div className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                  {stats.totalAssignments} affectations
                </div>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nouvel ouvrier
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, spécialité, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            </div>
            
            <select
              value={selectedAgency || ''}
              onChange={(e) => setSelectedAgency(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Toutes les agences</option>
              {agencies.map(agency => (
                <option key={agency.id} value={agency.id}>{agency.nom}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs seulement</option>
              <option value="inactive">Inactifs seulement</option>
            </select>

            <select
              value={specialiteFilter}
              onChange={(e) => setSpecialiteFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Toutes les spécialités</option>
              {specialites.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <button
              onClick={loadWorkers}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-500 bg-white"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="mx-6 mt-4 max-w-7xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Workers Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filteredWorkers.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun ouvrier trouvé</h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || selectedAgency || statusFilter !== 'all' || specialiteFilter
                ? 'Aucun ouvrier ne correspond aux filtres sélectionnés.'
                : 'Commencez par créer votre premier ouvrier.'}
            </p>
            {!searchTerm && !selectedAgency && statusFilter === 'all' && !specialiteFilter && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Créer un ouvrier
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map(worker => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onEdit={openEditModal}
                onStatusChange={handleSuccess}
                onError={handleError}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <WorkerModal
        isOpen={showModal}
        onClose={closeModal}
        onSuccess={handleSuccess}
        worker={editingWorker}
        agencies={agencies}
      />
    </div>
  );
}