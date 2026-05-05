'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Calendar, Clock, CheckCircle, AlertTriangle,
  Wrench, Car, ChevronRight, Zap, RefreshCw,
  UserCheck, ArrowRight, Phone
} from 'lucide-react';
import {
  Worker, Assignment,
  getWorkersByAgency, getAgencyAssignments,
  assignWorkerToAppointment, updateAssignmentStatus,
  getUnassignedAppointments,
} from '@/lib/api/workers';

// ─── Types ───────────────────────────────────────────────────────────────────
interface UnassignedAppointment {
  id: number;
  date_heure: string;
  statut: string;
  type_intervention?: string;
  client_nom: string;
  client_prenom: string;
  vehicule_immatriculation: string;
  vehicule_marque?: string;
  vehicule_modele?: string;
}

const STATUS_STYLE: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
  EN_COURS:   'bg-blue-100 text-blue-800',
  TERMINE:    'bg-green-100 text-green-800',
  ANNULE:     'bg-red-100 text-red-800',
  CONFIRME:   'bg-indigo-100 text-indigo-800',
  PLANIFIE:   'bg-purple-100 text-purple-800',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkersPage() {
  const { user, refreshUser } = useAuth();

  // agenceId in state so it can be resolved from server when localStorage is stale
  const [agenceId, setAgenceId] = useState<number | null>(user?.agence_id ?? null);

  const [workers, setWorkers]           = useState<Worker[]>([]);
  const [appointments, setAppointments] = useState<UnassignedAppointment[]>([]);
  const [assignments, setAssignments]   = useState<Assignment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // Assignment panel state
  const [selectedAppt, setSelectedAppt] = useState<UnassignedAppointment | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState<'board' | 'assignments'>('board');

  // ── Resolve agenceId: handles stale localStorage session ─────────────────────
  useEffect(() => {
    if (agenceId) return; // already have it
    // Fetch fresh user profile from server (JWT contains agence_id even if localStorage doesn't)
    refreshUser().then(fresh => {
      if (fresh?.agence_id) {
        setAgenceId(fresh.agence_id);
      } else {
        setError('Aucune agence associée à votre compte. Contactez un administrateur.');
        setLoading(false);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load data (triggered when agenceId becomes available) ────────────────────
  const loadAll = useCallback(async (id?: number) => {
    const resolvedId = id ?? agenceId;
    if (!resolvedId) return;
    setLoading(true); setError(null);
    try {
      const [w, a, asgn] = await Promise.all([
        getWorkersByAgency(resolvedId),
        getUnassignedAppointments(resolvedId),
        getAgencyAssignments(resolvedId),
      ]);
      setWorkers(w);
      setAppointments((a as any) || []);
      setAssignments(asgn);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [agenceId]);

  // Trigger loadAll whenever agenceId resolves
  useEffect(() => { if (agenceId) loadAll(agenceId); }, [agenceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit assignment ────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!selectedAppt || !selectedWorker) return;
    setSubmitting(true);
    try {
      await assignWorkerToAppointment({
        rendez_vous_id: selectedAppt.id,
        ouvrier_id: selectedWorker.id,
        notes_agent: notes || undefined,
      });
      setSuccessMsg(`${selectedWorker.prenom} ${selectedWorker.nom} affecté avec succès !`);
      setSelectedAppt(null); setSelectedWorker(null);
      setNotes('');
      await loadAll();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erreur lors de l\'affectation');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update assignment status ─────────────────────────────────────────────────
  const handleStatusChange = async (assignmentId: number, statut: string) => {
    try {
      await updateAssignmentStatus(assignmentId, { statut: statut as 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE' });
      await loadAll();
    } catch { /* silent */ }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const activeWorkers  = workers.filter(w => w.actif);
  const busyCount      = (w: Worker) => w.affectations_en_cours ?? 0;

  // ── Loading / error states ───────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-[#E30613] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Chargement en cours…</p>
      </div>
    </div>
  );

  if (error && !workers.length) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 max-w-sm">
        <AlertTriangle className="w-14 h-14 text-red-400 mx-auto" />
        <p className="text-red-600 font-semibold text-lg">{error}</p>
        <button onClick={() => loadAll()} className="px-5 py-2 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510] flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E30613] flex items-center justify-center shadow">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Distribution des Ouvriers</h1>
              <p className="text-sm text-gray-500">Affectez vos techniciens aux rendez-vous en attente</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* KPI badges */}
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {activeWorkers.length} techniciens actifs
            </span>
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
              {appointments.length} RDV à affecter
            </span>
            <button onClick={() => loadAll()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-1 border-b border-transparent">
          {(['board', 'assignments'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === t ? 'bg-[#E30613] text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              {t === 'board' ? '🗂️ Tableau d\'affectation' : `📋 Affectations en cours (${assignments.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Success toast ── */}
      {successMsg && (
        <div className="mx-6 mt-4 max-w-7xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">{successMsg}</p>
          </div>
        </div>
      )}

      {/* ── BOARD TAB ── */}
      {activeTab === 'board' && (
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* LEFT: Unassigned appointments */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Rendez-vous sans technicien
            </h2>

            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-700">Tous les rendez-vous sont affectés</p>
                <p className="text-sm text-gray-400 mt-1">Aucune action requise pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(appt => {
                  const isSelected = selectedAppt?.id === appt.id;
                  return (
                    <div key={appt.id} onClick={() => { setSelectedAppt(isSelected ? null : appt); setSelectedWorker(null); }}
                      className={`w-full text-left rounded-2xl border-2 p-4 transition-all shadow-sm cursor-pointer
                        ${isSelected
                          ? 'border-[#E30613] bg-red-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`}>
                      <div className="flex items-start gap-4">
                        {/* Date block */}
                        <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[56px]
                          ${isSelected ? 'bg-[#E30613] text-white' : 'bg-gray-100 text-gray-700'}`}>
                          <span className="text-lg font-bold leading-none">
                            {new Date(appt.date_heure).getDate()}
                          </span>
                          <span className="text-[10px] uppercase">
                            {new Date(appt.date_heure).toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 truncate">
                              {appt.client_prenom} {appt.client_nom}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[appt.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                              {appt.statut}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />
                              {appt.vehicule_marque} {appt.vehicule_modele} · {appt.vehicule_immatriculation}
                            </span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />
                              {new Date(appt.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {appt.type_intervention && (
                              <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> {appt.type_intervention}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform ${isSelected ? 'text-[#E30613] rotate-90' : 'text-gray-300'}`} />
                      </div>

                      {/* Worker selector (shown when appointment is selected) */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-[#E30613]" /> Choisir un technicien :
                          </p>
                          {activeWorkers.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Aucun technicien actif disponible.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {activeWorkers.map(w => {
                                const busy = busyCount(w);
                                const isSel = selectedWorker?.id === w.id;
                                return (
                                  <button key={w.id} type="button"
                                    onClick={e => { e.stopPropagation(); setSelectedWorker(isSel ? null : w); }}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all
                                      ${isSel ? 'border-[#E30613] bg-white shadow' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    {/* Avatar */}
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                                      ${isSel ? 'bg-[#E30613] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                      {w.prenom[0]}{w.nom[0]}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900 text-sm truncate">{w.prenom} {w.nom}</p>
                                      <p className="text-xs text-gray-400 truncate">{w.specialite || 'Généraliste'}</p>
                                    </div>
                                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0
                                      ${busy === 0 ? 'bg-green-100 text-green-700' : busy < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                      {busy} en cours
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Options row */}
                          {selectedWorker && (
                            <div className="mt-4 space-y-3">
                              {/* Notes */}
                              <div>
                                <label className="text-xs text-gray-500">Notes (optionnel)</label>
                                <input type="text" value={notes} placeholder="Instructions pour le technicien…"
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => setNotes(e.target.value)}
                                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E30613] focus:outline-none" />
                              </div>
                              {/* Confirm button */}
                              <button type="button" disabled={submitting} onClick={e => { e.stopPropagation(); handleAssign(); }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#E30613] hover:bg-[#C00510] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Affectation…</> :
                                  <><ArrowRight className="w-4 h-4" /> Confirmer l'affectation</>}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT: Workers panel */}
          <aside>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Équipe ({activeWorkers.length})
            </h2>
            <div className="space-y-3">
              {activeWorkers.map(w => {
                const busy = busyCount(w);
                const loadColor = busy === 0 ? 'bg-green-500' : busy < 3 ? 'bg-yellow-400' : 'bg-red-500';
                return (
                  <div key={w.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {w.prenom[0]}{w.nom[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{w.prenom} {w.nom}</p>
                        <p className="text-xs text-gray-400">{w.specialite || 'Généraliste'} · {w.niveau_competence || 'Intermédiaire'}</p>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${loadColor}`} title={`${busy} en cours`} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-500" /> {busy} affectation{busy > 1 ? 's' : ''} en cours
                      </span>
                      {w.telephone && (
                        <span className="text-gray-400 flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3" /> {w.telephone}
                        </span>
                      )}
                    </div>
                    {/* Load bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${loadColor}`}
                        style={{ width: `${Math.min(busy * 20, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
              {activeWorkers.length === 0 && (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Aucun technicien actif</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ── ASSIGNMENTS TAB ── */}
      {activeTab === 'assignments' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-14 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-600">Aucune affectation pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">Les affectations créées apparaîtront ici.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Technicien', 'Client / Véhicule', 'Date RDV', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map(a => (
                    <tr key={a.affectation_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                            {(a.ouvrier_prenom?.[0] ?? '?')}{(a.ouvrier_nom?.[0] ?? '')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{a.ouvrier_prenom} {a.ouvrier_nom}</p>
                            <p className="text-xs text-gray-400">{a.ouvrier_specialite}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{a.client_prenom} {a.client_nom}</p>
                        <p className="text-xs text-gray-400">{a.marque} {a.modele} · {a.immatriculation}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {fmtDate(a.date_affectation)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[a.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                          {a.statut}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          defaultValue={a.statut}
                          onChange={e => handleStatusChange(a.affectation_id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:ring-1 focus:ring-[#E30613] focus:outline-none">
                          <option value="EN_ATTENTE">En attente</option>
                          <option value="EN_COURS">En cours</option>
                          <option value="TERMINE">Terminé</option>
                          <option value="ANNULE">Annulé</option>
                        </select>
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
