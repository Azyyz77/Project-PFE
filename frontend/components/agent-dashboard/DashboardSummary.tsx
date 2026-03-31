'use client';
/**
 * DashboardSummary — Cartes KPI du tableau de bord agent
 */
import { DashboardSummary as Summary } from '@/types/agentDashboard';

interface Props { data: Summary; onRefresh: () => void; }

interface KpiCard {
  label: string;
  value: number;
  icon: string;
  color: string;   // bg gradient classes
  glow: string;    // shadow color
}

export default function DashboardSummary({ data, onRefresh }: Props) {
  const cards: KpiCard[] = [
    {
      label: "Rendez-vous aujourd'hui",
      value: data.rendez_vous_aujourd_hui,
      icon:  '📅',
      color: 'from-blue-600 to-blue-500',
      glow:  'shadow-blue-500/30',
    },
    {
      label: 'En attente',
      value: data.rendez_vous_en_attente,
      icon:  '⏳',
      color: 'from-amber-500 to-orange-400',
      glow:  'shadow-amber-500/30',
    },
    {
      label: 'Interventions en cours',
      value: data.interventions_en_cours,
      icon:  '🔧',
      color: 'from-violet-600 to-purple-500',
      glow:  'shadow-violet-500/30',
    },
    {
      label: 'Terminées aujourd\'hui',
      value: data.interventions_terminees,
      icon:  '✅',
      color: 'from-emerald-600 to-green-500',
      glow:  'shadow-emerald-500/30',
    },
    {
      label: 'Réclamations ouvertes',
      value: data.reclamations_ouvertes,
      icon:  '⚠️',
      color: 'from-red-600 to-rose-500',
      glow:  'shadow-red-500/30',
    },
    {
      label: 'Véhicules à valider',
      value: data.vehicules_a_valider,
      icon:  '🚗',
      color: 'from-cyan-600 to-teal-500',
      glow:  'shadow-cyan-500/30',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-bold">Vue d'ensemble</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Mis à jour à {new Date(data.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-colors"
        >
          <span>↻</span> Actualiser
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color}
              shadow-lg ${card.glow} p-5 flex items-center gap-4 group hover:scale-[1.02] transition-transform`}
          >
            {/* Decorative circle */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
              {card.icon}
            </div>
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-medium leading-tight">{card.label}</p>
              <p className="text-white text-4xl font-bold mt-0.5 leading-none">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick status overview */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h3 className="text-white font-semibold mb-4">Résumé de la journée</h3>
        <div className="space-y-3">
          {[
            { label: 'Taux de complétion', value: data.rendez_vous_aujourd_hui > 0
                ? Math.round((data.interventions_terminees / data.rendez_vous_aujourd_hui) * 100)
                : 0, suffix: '%', color: 'bg-emerald-500' },
            { label: 'Charge de travail', value: data.rendez_vous_en_attente + data.interventions_en_cours,
                suffix: ' rdv actifs', color: 'bg-blue-500' },
            { label: 'Alertes (réclamations + véhicules)', value: data.reclamations_ouvertes + data.vehicules_a_valider,
                suffix: ' à traiter', color: 'bg-amber-500' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-4">
              <p className="text-slate-400 text-sm w-64 shrink-0">{row.label}</p>
              <div className="flex-1 bg-slate-800 rounded-full h-2">
                <div
                  className={`${row.color} h-2 rounded-full transition-all`}
                  style={{ width: `${Math.min(100, row.value * (row.suffix === '%' ? 1 : 10))}%` }}
                />
              </div>
              <p className="text-white text-sm font-semibold w-24 text-right">
                {row.value}{row.suffix}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
