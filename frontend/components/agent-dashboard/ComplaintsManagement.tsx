'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type ComplaintStatus = 'SOUMISE' | 'EN_COURS' | 'TRAITEE' | 'CLOTUREE';

interface Complaint {
  id: number;
  numero: string;
  sujet: string;
  description: string;
  statut: ComplaintStatus;
  date_creation: string;
  date_traitement?: string;
  date_resolution?: string;
  client_nom: string;
  client_email?: string;
  client_tel?: string;
  agent_nom?: string;
}

interface Props {
  token: string;
}

export default function ComplaintsManagement({ token }: Props) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComplaintStatus | ''>('');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [filter]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const API_URL = rawBaseUrl.endsWith('/api')
        ? rawBaseUrl.slice(0, -4)
        : rawBaseUrl.replace(/\/$/, '');
      const url = filter 
        ? `${API_URL}/api/agent-dashboard/complaints?statut=${filter}`
        : `${API_URL}/api/agent-dashboard/complaints`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des réclamations');
      }

      const data = await response.json();
      setComplaints(data.data || data.complaints || data);
      
      if (activeComplaint) {
        const updated = (data.data || data.complaints || data).find((c: Complaint) => c.id === activeComplaint.id);
        setActiveComplaint(updated || null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les réclamations' });
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (statut: ComplaintStatus) => {
    const map: Record<ComplaintStatus, string> = {
      SOUMISE:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      EN_COURS: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      TRAITEE:  'bg-green-500/20 text-green-400 border-green-500/50',
      CLOTUREE: 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    };
    const labels: Record<ComplaintStatus, string> = {
      SOUMISE: 'Soumise',
      EN_COURS: 'En cours',
      TRAITEE: 'Traitée',
      CLOTUREE: 'Clôturée'
    };
    const c = map[statut] || 'bg-slate-500/20 text-slate-400';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c}`}>{labels[statut]}</span>;
  };

  const handleStatusChange = async (statut: ComplaintStatus) => {
    if (!activeComplaint) return;
    if (!confirm(`Passer au statut ${statut} ?`)) return;
    
    try {
      const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const API_URL = rawBaseUrl.endsWith('/api')
        ? rawBaseUrl.slice(0, -4)
        : rawBaseUrl.replace(/\/$/, '');
      const response = await fetch(`${API_URL}/api/agent-dashboard/complaints/${activeComplaint.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ statut }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      toast.success('Statut mis à jour avec succès');
      loadComplaints();
    } catch (e) {
      toast.error('Erreur', { description: 'Impossible de mettre à jour le statut' });
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-xl font-bold text-white">Gestion des Réclamations</h2>
        <div className="flex gap-2">
          {[
            { value: '', label: 'Toutes' },
            { value: 'SOUMISE', label: 'Soumises' },
            { value: 'EN_COURS', label: 'En cours' },
            { value: 'TRAITEE', label: 'Traitées' },
            { value: 'CLOTUREE', label: 'Clôturées' }
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => { setFilter(s.value as ComplaintStatus | ''); setActiveComplaint(null); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === s.value ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s.label}
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
                      {c.client_nom}
                    </span>
                    <span className={activeComplaint?.id === c.id ? 'text-blue-200' : 'text-slate-500'}>
                      {c.numero}
                    </span>
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
                  <div className="flex gap-4 text-sm text-slate-400 flex-wrap">
                    <p>De: <span className="text-white">{activeComplaint.client_nom}</span></p>
                    {activeComplaint.client_email && (
                      <p>Email: <span className="text-white">{activeComplaint.client_email}</span></p>
                    )}
                    {activeComplaint.client_tel && (
                      <p>Tél: <span className="text-white">{activeComplaint.client_tel}</span></p>
                    )}
                    <p>Le: <span className="text-white">{new Date(activeComplaint.date_creation).toLocaleString('fr-FR')}</span></p>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    Numéro: <span className="text-white">{activeComplaint.numero}</span>
                  </p>
                </div>
                {/* Actions Statut */}
                <div className="flex flex-col gap-2 shrink-0">
                  {statusBadge(activeComplaint.statut)}
                  {activeComplaint.statut === 'SOUMISE' && (
                    <button 
                      onClick={() => handleStatusChange('EN_COURS')} 
                      className="mt-2 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-blue-500/50"
                    >
                      Prendre en charge
                    </button>
                  )}
                  {activeComplaint.statut === 'EN_COURS' && (
                    <button 
                      onClick={() => handleStatusChange('TRAITEE')} 
                      className="mt-2 text-xs bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-green-500/50"
                    >
                      Marquer Traitée
                    </button>
                  )}
                  {activeComplaint.statut === 'TRAITEE' && (
                    <button 
                      onClick={() => handleStatusChange('CLOTUREE')} 
                      className="mt-2 text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors border border-slate-600"
                    >
                      Clôturer
                    </button>
                  )}
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Description de la réclamation</h4>
                  <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                    {activeComplaint.description}
                  </p>
                  
                  {activeComplaint.date_traitement && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-400">
                        Prise en charge le: <span className="text-white">{new Date(activeComplaint.date_traitement).toLocaleString('fr-FR')}</span>
                      </p>
                    </div>
                  )}
                  
                  {activeComplaint.date_resolution && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-400">
                        Résolue le: <span className="text-white">{new Date(activeComplaint.date_resolution).toLocaleString('fr-FR')}</span>
                      </p>
                    </div>
                  )}
                  
                  {activeComplaint.agent_nom && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-400">
                        Agent: <span className="text-white">{activeComplaint.agent_nom}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
