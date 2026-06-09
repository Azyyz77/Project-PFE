'use client';

import { useState, useEffect } from 'react';
import { fetchStatistics } from '@/lib/api/agentDashboard';
import { Statistics } from '@/types/agentDashboard';
import { toast } from 'sonner';

interface Props {
  token: string;
}

export default function StatisticsPanel({ token }: Props) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchStatistics();
      setStats(data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les statistiques' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-slate-400">Chargement des statistiques...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-slate-400">Aucune donnée disponible</p>
      </div>
    );
  }

  const totalRdv = stats.daily?.reduce((sum, d) => sum + d.nombre, 0) ?? 0;
  const totalTermines = stats.daily?.reduce((sum, d) => sum + d.termines, 0) ?? 0;
  const totalAnnules = stats.daily?.reduce((sum, d) => sum + d.annules, 0) ?? 0;
  const tauxReussite = totalRdv > 0 ? Math.round((totalTermines / totalRdv) * 100) : 0;

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold text-white">Statistiques du Mois</h2>
        <button
          onClick={loadStats}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors border border-slate-700"
        >
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-slate-900 border border-blue-500/30 p-5 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Rendez-vous Total</p>
          <p className="text-3xl font-bold text-white">{totalRdv}</p>
          <p className="text-xs text-slate-400 mt-2">Ce mois</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Terminés</p>
          <p className="text-3xl font-bold text-emerald-400">{totalTermines}</p>
          <p className="text-xs text-slate-400 mt-2">{tauxReussite}% de réussite</p>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-slate-900 border border-red-500/30 p-5 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Annulés</p>
          <p className="text-3xl font-bold text-red-400">{totalAnnules}</p>
          <p className="text-xs text-slate-400 mt-2">
            {totalRdv > 0 ? Math.round((totalAnnules / totalRdv) * 100) : 0}% du total
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-slate-900 border border-amber-500/30 p-5 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Temps Moyen</p>
          <p className="text-3xl font-bold text-amber-400">
            {stats.avgTime}
            <span className="text-sm ml-1">min</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">Par intervention</p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">Réclamations (Ce mois)</h3>
          <div className="space-y-4">
            {[
              { label: 'Ouvertes', val: stats.complaints.ouvertes, c: 'text-red-400 bg-red-500/10' },
              { label: 'En cours', val: stats.complaints.en_cours, c: 'text-amber-400 bg-amber-500/10' },
              { label: 'Résolues', val: stats.complaints.resolues, c: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Fermées',  val: stats.complaints.fermees,  c: 'text-slate-400 bg-slate-500/10' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
                <span className="text-slate-300">{r.label}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.c}`}>{r.val}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm">
            <span className="text-slate-400">Total réclamations:</span>
            <span className="text-white font-bold">{stats.complaints.total}</span>
          </div>
        </div>

        {/* Top interventions */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col">
          <h3 className="text-white font-semibold mb-4">Interventions les plus fréquentes</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {stats.byType.map((t, idx) => (
              <div key={t.type} className="flex justify-between items-center p-3 rounded-xl border border-slate-800 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono w-4">#{idx + 1}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{t.type}</p>
                    <p className="text-xs text-slate-500">{t.temps_moyen || 0} min en moyenne</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-blue-400 font-bold">{t.nombre}</span>
                  <p className="text-[10px] text-slate-500">réalisées</p>
                </div>
              </div>
            ))}
            {stats.byType.length === 0 && (
              <p className="text-slate-500 text-center py-4 text-sm">Aucune donnée ce mois-ci.</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Distribution */}
      {stats.daily && stats.daily.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">Distribution Quotidienne</h3>
          <div className="space-y-3">
            {stats.daily.slice(0, 15).map((day, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Jour {day.jour}</span>
                  <span>{day.nombre} rdv</span>
                </div>
                <div className="flex gap-1 items-center">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded h-2"
                    style={{
                      width: `${(day.nombre / Math.max(...stats.daily.map((d) => d.nombre), 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
