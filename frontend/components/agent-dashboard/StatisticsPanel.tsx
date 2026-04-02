'use client';
import { useState, useEffect } from 'react';
import { fetchStatistics } from '@/lib/api/agentDashboard';
import { Statistics } from '@/types/agentDashboard';

interface Props { token: string; }

export default function StatisticsPanel({ token }: Props) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchStatistics(token);
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Chargement des statistiques...</div>;
  if (!stats) return <div className="p-6 text-slate-400">Aucune donnée disponible.</div>;

  const totalRdv = stats.daily?.reduce((sum, d) => sum + d.nombre, 0) ?? 0;
  const totalTermines = stats.daily?.reduce((sum, d) => sum + d.termines, 0) ?? 0;
  const totalAnnules = stats.daily?.reduce((sum, d) => sum + d.annules, 0) ?? 0;
  const totalInterventions = stats.byType?.reduce((sum, t) => sum + t.nombre, 0) ?? 0;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Statistiques Mensuelles</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Rapides */}
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">Rdv ce mois</p>
            <p className="text-white text-3xl font-bold">
              {totalRdv}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">Rdv Terminés</p>
            <p className="text-emerald-400 text-3xl font-bold">
              {totalTermines}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">Rdv Annulés</p>
            <p className="text-red-400 text-3xl font-bold">
              {totalAnnules}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">Temps moyen/Interv.</p>
            <p className="text-amber-400 text-3xl font-bold">
              {stats.avgTime} <span className="text-sm">min</span>
            </p>
          </div>
        </div>

        {/* Réclamations */}
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
    </div>
  );
}
