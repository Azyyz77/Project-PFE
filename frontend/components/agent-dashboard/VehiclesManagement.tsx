'use client';

import { useState, useEffect } from 'react';
import { fetchVehicles, validateVehicle, rejectVehicle } from '@/lib/api/agentDashboard';
import { Vehicle } from '@/types/agentDashboard';
import { toast } from 'sonner';

interface Props {
  token: string;
}

export default function VehiclesManagement({ token }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicles();
  }, [filter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await fetchVehicles(token, filter || undefined);
      setVehicles(data);
      if (selectedVehicle) {
        setSelectedVehicle(
          data.find((v: Vehicle) => v.id === selectedVehicle.id) || null
        );
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les véhicules' });
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (statut: string) => {
    const map: Record<string, string> = {
      EN_ATTENTE: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
      VALIDE:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      REFUSE:     'bg-red-500/20 text-red-400 border-red-500/50'
    };
    const c = map[statut] || 'bg-slate-500/20 text-slate-400';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c}`}>{statut}</span>;
  };

  const handleAction = async (id: number, action: 'validate' | 'reject') => {
    try {
      if (action === 'validate') {
        if (!confirm('Valider ce véhicule ?')) return;
        await validateVehicle(token, id);
        toast.success('Véhicule validé');
      } else {
        const motif = prompt('Motif du refus ?');
        if (motif === null) return;
        await rejectVehicle(token, id, motif);
        toast.success('Véhicule refusé');
      }
      loadVehicles();
    } catch (e) {
      toast.error('Erreur', {
        description: (e as any)?.response?.data?.error || 'Action impossible'
      });
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-white">Gestion des Véhicules</h2>
        <div className="flex gap-2">
          {['', 'EN_ATTENTE', 'VALIDE', 'REFUSE'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setSelectedVehicle(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s || 'Tous'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* List */}
        <div className="w-2/5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <h3 className="text-white font-medium">Véhicules ({vehicles.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <p className="text-center text-slate-500 py-4">Chargement...</p>
            ) : vehicles.length === 0 ? (
              <p className="text-center text-slate-500 py-4">Aucun véhicule</p>
            ) : (
              vehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedVehicle?.id === v.id
                      ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white truncate pr-2">
                      {v.marque} {v.modele}
                    </span>
                    <span className="shrink-0">{statusBadge(v.statut_validation)}</span>
                  </div>
                  <p className={`text-xs font-mono mb-2 ${
                    selectedVehicle?.id === v.id ? 'text-blue-200' : 'text-slate-400'
                  }`}>
                    {v.immatriculation}
                  </p>
                  <p className={`text-xs ${
                    selectedVehicle?.id === v.id ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {v.client_nom} {v.client_prenom}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {!selectedVehicle ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
              <span className="text-4xl text-slate-700">📄</span>
              <p>Sélectionnez un véhicule pour voir les détails</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedVehicle.marque} {selectedVehicle.modele}
                  </h3>
                  {selectedVehicle.annee && (
                    <p className="text-sm text-slate-400">Année: {selectedVehicle.annee}</p>
                  )}
                </div>
                <span>{statusBadge(selectedVehicle.statut_validation)}</span>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Main Info */}
                <div className="space-y-3">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Immatriculation</p>
                    <p className="text-white font-mono text-lg">{selectedVehicle.immatriculation}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Numéro VIN</p>
                    <p className="text-white font-mono text-sm break-all">{selectedVehicle.vin}</p>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-5 border border-slate-700">
                  <h4 className="text-sm font-semibold text-white mb-4">Propriétaire du véhicule</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nom:</span>
                      <span className="text-white font-medium">{selectedVehicle.client_nom} {selectedVehicle.client_prenom}</span>
                    </div>
                    {selectedVehicle.telephone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Téléphone:</span>
                        <span className="text-white font-mono">{selectedVehicle.telephone}</span>
                      </div>
                    )}
                    {selectedVehicle.email && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-white font-mono text-xs">{selectedVehicle.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedVehicle.statut_validation === 'REFUSE' && selectedVehicle.motif_refus && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-2">Motif du refus</p>
                    <p className="text-red-300 text-sm">{selectedVehicle.motif_refus}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedVehicle.statut_validation === 'EN_ATTENTE' && (
                <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex gap-3">
                  <button
                    onClick={() => handleAction(selectedVehicle.id, 'validate')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => handleAction(selectedVehicle.id, 'reject')}
                    className="flex-1 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
