'use client';
import { useState, useEffect } from 'react';
import { fetchAppointments, confirmAppointment, startIntervention, finishIntervention, cancelAppointment } from '@/lib/api/agentDashboard';
import { Appointment } from '@/types/agentDashboard';

interface Props { token: string; }

export default function AppointmentsList({ token }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchAppointments(token, { statut: filter || undefined });
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (statut: string) => {
    const map: Record<string, string> = {
      EN_ATTENTE: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
      PLANIFIE:   'bg-amber-500/20 text-amber-500 border-amber-500/50',
      CONFIRME:   'bg-blue-500/20 text-blue-400 border-blue-500/50',
      EN_COURS:   'bg-violet-500/20 text-violet-400 border-violet-500/50',
      TERMINE:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      ANNULE:     'bg-red-500/20 text-red-400 border-red-500/50'
    };
    const c = map[statut] || 'bg-slate-500/20 text-slate-400';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c}`}>{statut}</span>;
  };

  const actionButton = (rdv: Appointment) => {
    const btn = (onClick: () => void, label: string, color: string) => (
      <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${color}`}>
        {label}
      </button>
    );

    switch (rdv.statut) {
      case 'EN_ATTENTE':
      case 'PLANIFIE':
        return btn(() => handleAction(rdv.id, confirmAppointment), 'Confirmer', 'bg-blue-600 hover:bg-blue-500 text-white');
      case 'CONFIRME':
        return btn(() => handleAction(rdv.id, startIntervention), 'Démarrer', 'bg-violet-600 hover:bg-violet-500 text-white');
      case 'EN_COURS':
        return btn(() => handleAction(rdv.id, finishIntervention), 'Terminer', 'bg-emerald-600 hover:bg-emerald-500 text-white');
      default:
        return null; // Terminé ou Annulé
    }
  };

  const handleAction = async (id: number, actionFn: (t: string, id: number) => Promise<any>) => {
    try {
      if (!confirm('Êtes-vous sûr ?')) return;
      await actionFn(token, id);
      loadAppointments(); // Refresh
    } catch (e) {
      alert('Erreur: ' + (e as any)?.response?.data?.error || 'Erreur inconnue');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gestion des Rendez-vous</h2>
        <div className="flex gap-2">
          {['', 'PLANIFIE', 'EN_ATTENTE', 'CONFIRME', 'EN_COURS', 'TERMINE'].map((s) => (
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

      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-8 text-slate-400">Chargement...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center p-8 text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
            Aucun rendez-vous {filter && 'pour ce statut'}
          </div>
        ) : (
          appointments.map((rdv) => (
            <div key={rdv.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-lg">
                      {new Date(rdv.date_rendez_vous).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </h3>
                    {statusBadge(rdv.statut)}
                  </div>
                  <p className="text-slate-400 text-sm">
                    🚗 {rdv.marque_nom} {rdv.modele_nom} — {rdv.immatriculation} 
                    {rdv.vin && ` (VIN: ${rdv.vin})`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {rdv.statut !== 'ANNULE' && rdv.statut !== 'TERMINE' && (
                    <button
                      onClick={() => handleAction(rdv.id, (t, id) => cancelAppointment(t, id, 'Annulé par agent'))}
                      className="text-slate-500 hover:text-red-400 text-sm px-3 py-2"
                    >
                      Annuler
                    </button>
                  )}
                  {actionButton(rdv)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Client</p>
                  <p className="text-white font-medium">{rdv.client_nom} {rdv.client_prenom}</p>
                  <p className="text-slate-400 text-sm">{rdv.client_telephone}</p>
                  <p className="text-slate-400 text-sm">{rdv.client_email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Interventions prévues</p>
                  {rdv.interventions?.length > 0 ? (
                    <ul className="space-y-1">
                      {rdv.interventions.map((inv) => (
                        <li key={inv.id} className="text-slate-300 text-sm flex justify-between">
                          <span>🔧 {inv.type_nom} ({inv.sous_type_nom})</span>
                          <span className="text-slate-500">{inv.prix} DT</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-sm italic">Aucune intervention spécifique</p>
                  )}
                  {rdv.description && (
                    <p className="mt-2 text-slate-400 text-sm whitespace-pre-line border-l-2 border-slate-700 pl-3">
                      "{rdv.description}"
                    </p>
                  )}
                </div>
              </div>

              {/* Timer info si rdv terminé */}
              {rdv.statut === 'TERMINE' && (
                <div className="mt-4 bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Durée d'intervention réelle :</span>
                  <span className="text-emerald-400 font-medium font-mono">{rdv.duree_reelle} minutes</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
