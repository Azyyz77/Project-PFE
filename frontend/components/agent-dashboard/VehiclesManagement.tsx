'use client';
import { useState, useEffect } from 'react';
import { fetchVehicles, validateVehicle, rejectVehicle } from '@/lib/api/agentDashboard';
import { Vehicle } from '@/types/agentDashboard';

interface Props { token: string; }

export default function VehiclesManagement({ token }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadVehicles();
  }, [filter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await fetchVehicles(token, filter || undefined);
      setVehicles(data);
    } catch (error) {
      console.error(error);
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
      } else {
        const motif = prompt('Motif du refus ?');
        if (motif === null) return;
        await rejectVehicle(token, id, motif);
      }
      loadVehicles();
    } catch (e) {
      alert('Erreur: ' + (e as any)?.response?.data?.error || 'Inconnue');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gestion des Véhicules</h2>
        <div className="flex gap-2">
          {['', 'EN_ATTENTE', 'VALIDE', 'REFUSE'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s || 'Tous'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center p-8 text-slate-400">Chargement...</div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-full text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
            Aucun véhicule trouvé.
          </div>
        ) : (
          vehicles.map((v) => (
            <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{v.marque} {v.modele} {v.annee ? `(${v.annee})` : ''}</h3>
                    <p className="text-slate-400 font-mono text-sm">{v.immatriculation}</p>
                  </div>
                  {statusBadge(v.statut_validation)}
                </div>

                <div className="text-sm text-slate-400 mb-4">
                  <p>VIN: <span className="text-slate-300 font-mono">{v.vin}</span></p>
                  <p className="mt-2 text-white">Propriétaire:</p>
                  <p>{v.client_nom} {v.client_prenom}</p>
                  <p>{v.telephone} — {v.email}</p>
                </div>

                {v.statut_validation === 'REFUSE' && v.motif_refus && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs text-red-400 uppercase font-semibold mb-1">Motif du refus</p>
                    <p className="text-red-300 text-sm italic">{v.motif_refus}</p>
                  </div>
                )}
              </div>

              {v.statut_validation === 'EN_ATTENTE' && (
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button onClick={() => handleAction(v.id, 'validate')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                    Valider
                  </button>
                  <button onClick={() => handleAction(v.id, 'reject')} className="flex-1 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 py-2 rounded-xl text-sm font-medium transition-colors">
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
