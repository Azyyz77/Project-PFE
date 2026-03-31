'use client';
import { useState, useEffect } from 'react';
import { fetchComplaints, answerComplaint, updateComplaintStatus } from '@/lib/api/agentDashboard';
import { Complaint } from '@/types/agentDashboard';

interface Props { token: string; }

export default function ComplaintsManagement({ token }: Props) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [filter]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await fetchComplaints(token, filter || undefined);
      setComplaints(data);
      if (activeComplaint) {
        setActiveComplaint(data.find((c: Complaint) => c.id === activeComplaint.id) || null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (statut: string) => {
    const map: Record<string, string> = {
      OUVERTE:  'bg-red-500/20 text-red-400 border-red-500/50',
      EN_COURS: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
      RESOLUE:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      FERMEE:   'bg-slate-500/20 text-slate-400 border-slate-500/50'
    };
    const c = map[statut] || 'bg-slate-500/20 text-slate-400';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c}`}>{statut}</span>;
  };

  const priorityBadge = (prio: string) => {
    const map: Record<string, string> = {
      BASSE:    'text-slate-400',
      NORMAL:   'text-blue-400',
      HAUTE:    'text-orange-400',
      CRITIQUE: 'text-red-500 font-bold'
    };
    return <span className={`text-xs uppercase tracking-wider ${map[prio] || 'text-slate-400'}`}>{prio}</span>;
  };

  const handleReply = async () => {
    if (!activeComplaint || !replyText.trim()) return;
    try {
      await answerComplaint(token, activeComplaint.id, replyText);
      setReplyText('');
      loadComplaints();
    } catch (e) {
      alert('Erreur envoi réponse');
    }
  };

  const handleStatusChange = async (statut: string) => {
    if (!activeComplaint) return;
    if (!confirm(`Passer au statut ${statut} ?`)) return;
    try {
      await updateComplaintStatus(token, activeComplaint.id, statut);
      loadComplaints();
    } catch (e) {
      alert('Erreur maj statut');
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-xl font-bold text-white">Gestion des Réclamations</h2>
        <div className="flex gap-2">
          {['', 'OUVERTE', 'EN_COURS', 'RESOLUE', 'FERMEE'].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setActiveComplaint(null); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s || 'Toutes'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Liste */}
        <div className="w-1/3 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <h3 className="text-white font-medium">Liste des tickets ({complaints.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <p className="text-center text-slate-500 py-4">Chargement...</p>
            ) : complaints.length === 0 ? (
              <p className="text-center text-slate-500 py-4">Aucune réclamation</p>
            ) : (
              complaints.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveComplaint(c)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeComplaint?.id === c.id
                      ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white truncate pr-2">{c.sujet}</span>
                    <span className="shrink-0">{statusBadge(c.statut)}</span>
                  </div>
                  <p className={`text-xs line-clamp-2 mb-3 ${activeComplaint?.id === c.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {c.description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className={activeComplaint?.id === c.id ? 'text-blue-200' : 'text-slate-500'}>
                      {c.client_nom} {c.client_prenom}
                    </span>
                    {priorityBadge(c.priorite)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Détail */}
        <div className="w-2/3 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {!activeComplaint ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
              <span className="text-4xl text-slate-700">⚠️</span>
              <p>Sélectionnez une réclamation pour voir les détails</p>
            </div>
          ) : (
            <>
              {/* Header Détail */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{activeComplaint.sujet}</h3>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <p>De: <span className="text-white">{activeComplaint.client_nom} {activeComplaint.client_prenom}</span> ({activeComplaint.email})</p>
                    <p>Le: <span className="text-white">{new Date(activeComplaint.date_creation).toLocaleString('fr-FR')}</span></p>
                    <p>Priorité: {priorityBadge(activeComplaint.priorite)}</p>
                  </div>
                  {activeComplaint.date_rendez_vous && (
                    <p className="text-sm text-blue-400 mt-2">
                      Concerne le RDV du {new Date(activeComplaint.date_rendez_vous).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
                {/* Actions Statut */}
                <div className="flex flex-col gap-2 shrink-0">
                  {statusBadge(activeComplaint.statut)}
                  {activeComplaint.statut !== 'RESOLUE' && activeComplaint.statut !== 'FERMEE' && (
                    <button onClick={() => handleStatusChange('RESOLUE')} className="mt-2 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/50">
                      Marquer Résolue
                    </button>
                  )}
                  {activeComplaint.statut === 'RESOLUE' && (
                    <button onClick={() => handleStatusChange('FERMEE')} className="mt-2 text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors border border-slate-600">
                      Clôturer
                    </button>
                  )}
                </div>
              </div>

              {/* Chat / Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Message initial du client */}
                <div className="flex gap-4 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs shrink-0 mt-1">
                    C
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 border border-slate-700 text-slate-300 text-sm whitespace-pre-line">
                    {activeComplaint.description}
                  </div>
                </div>

                {/* Réponses de l'agent */}
                {activeComplaint.reponses?.map(r => (
                  <div key={r.id} className="flex gap-4 max-w-[85%] ml-auto justify-end">
                    <div className="bg-blue-600 rounded-2xl rounded-tr-sm p-4 text-white text-sm whitespace-pre-line shadow-lg shadow-blue-900/20">
                      {r.message}
                      <p className="text-[10px] text-blue-200 mt-2 text-right">
                        Par {r.agent_nom} {r.agent_prenom} — {new Date(r.date_creation).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shrink-0 mt-1 border border-blue-400">
                      A
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone de réponse */}
              {activeComplaint.statut !== 'FERMEE' && (
                <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
                  <div className="flex gap-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Votre réponse..."
                      className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl font-medium transition-colors"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
