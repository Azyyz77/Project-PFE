'use client';
import { useState, useEffect } from 'react';
import { fetchStatistics } from '@/lib/api/agentDashboard';

interface Props { token: string; }

interface StatsData {
  appointmentsByMonth: number[];
  interventionsByType: Array<{ label: string; value: number }>;
  kpi: {
    satisfaction_rate: number;
    average_resolution_time: number;
  };
}

export default function StatisticsPanel({ token }: Props) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [token]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchStatistics(token);
      // Fallback avec des valeurs par défaut
      setStats({
        appointmentsByMonth: data?.appointmentsByMonth || Array(12).fill(0),
        interventionsByType: data?.interventionsByType || [],
        kpi: {
          satisfaction_rate: data?.kpi?.satisfaction_rate || 0,
          average_resolution_time: data?.kpi?.average_resolution_time || 0,
        },
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      // Valeurs par défaut en cas d'erreur
      setStats({
        appointmentsByMonth: Array(12).fill(0),
        interventionsByType: [],
        kpi: { satisfaction_rate: 0, average_resolution_time: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Chargement des statistiques...</div>;
  if (!stats) return <div className="p-6 text-slate-400">Aucune donnée disponible.</div>;

  // Calculs
  const totalAppointments = stats.appointmentsByMonth.reduce((s, v) => s + v, 0);
  const satisfactionRate = Math.max(0, Math.min(100, stats.kpi.satisfaction_rate || 0));

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Statistiques Mensuelles</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* KPI Rapides */}
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">Rdv ce mois</p>
            <p className="text-white text-3xl font-bold">
              {totalAppointments}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">Taux satisfaction</p>
            <p className="text-emerald-400 text-3xl font-bold">
              {satisfactionRate}%
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">Interventions</p>
            <p className="text-blue-400 text-3xl font-bold">
              {stats.interventionsByType.reduce((s, t) => s + t.value, 0)}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm mb-1">Temps moyen</p>
            <p className="text-amber-400 text-3xl font-bold">
              {stats.kpi.average_resolution_time} <span className="text-sm">min</span>
            </p>
          </div>
        </div>

        {/* Interventions par type */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col">
          <h3 className="text-white font-semibold mb-4">Interventions les plus fréquentes</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {stats.interventionsByType.map((t, idx) => (
              <div key={t.label} className="flex justify-between items-center p-3 rounded-xl border border-slate-800 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono w-4">#{idx + 1}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{t.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-blue-400 font-bold">{t.value}</span>
                  <p className="text-[10px] text-slate-500">réalisées</p>
                </div>
              </div>
            ))}
            {stats.interventionsByType.length === 0 && (
              <p className="text-slate-500 text-center py-4 text-sm">Aucune interventions ce mois-ci.</p>
            )}
          </div>
        </div>

        {/* Graphique rendez-vous par mois */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">Rendez-vous par mois</h3>
          <div className="flex items-end h-32 gap-2 px-2">
            {stats.appointmentsByMonth.map((val, idx) => {
              const maxVal = Math.max(...stats.appointmentsByMonth, 1);
              const height = (val / maxVal) * 100;
              const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${monthNames[idx]}: ${val} RDV`}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">{monthNames[idx]}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
