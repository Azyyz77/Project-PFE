'use client';
/**
 * DashboardSummary — Cartes KPI du tableau de bord agent
 */
import { useState } from 'react';
import { DashboardSummary as Summary } from '@/types/agentDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface Props {
  data: Summary;
  onRefresh: () => void;
}

interface KpiCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  glow: string;
}

export default function DashboardSummary({ data, onRefresh }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const cards: KpiCard[] = [
    {
      label: "Rendez-vous aujourd'hui",
      value: data.rendez_vous_aujourd_hui,
      icon: '📅',
      color: 'from-blue-600 to-blue-500',
      glow: 'shadow-blue-500/30',
    },
    {
      label: 'En attente',
      value: data.rendez_vous_en_attente,
      icon: '⏳',
      color: 'from-amber-500 to-orange-400',
      glow: 'shadow-amber-500/30',
    },
    {
      label: 'Interventions en cours',
      value: data.interventions_en_cours,
      icon: '🔧',
      color: 'from-violet-600 to-purple-500',
      glow: 'shadow-violet-500/30',
    },
    {
      label: "Terminées aujourd'hui",
      value: data.interventions_terminees,
      icon: '✅',
      color: 'from-emerald-600 to-green-500',
      glow: 'shadow-emerald-500/30',
    },
    {
      label: 'Réclamations ouvertes',
      value: data.reclamations_ouvertes,
      icon: '⚠️',
      color: 'from-red-600 to-rose-500',
      glow: 'shadow-red-500/30',
    },
    {
      label: 'Véhicules à valider',
      value: data.vehicules_a_valider,
      icon: '🚗',
      color: 'from-cyan-600 to-teal-500',
      glow: 'shadow-cyan-500/30',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Vue d'ensemble
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {(() => {
              const formattedDate =
                data.timestamp && !isNaN(new Date(data.timestamp).getTime())
                  ? new Intl.DateTimeFormat('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(data.timestamp))
                  : new Intl.DateTimeFormat('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date());
              return `Mis à jour à ${formattedDate}`;
            })()}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="lg"
          className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color}
              shadow-lg ${card.glow} p-5 flex items-center gap-4 group hover:scale-[1.02] hover:shadow-xl transition-all cursor-pointer border-t-2 border-white/20`}
          >
            {/* Decorative circles */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              {card.icon}
            </div>
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-medium leading-tight">{card.label}</p>
              <p className="text-white text-4xl font-bold font-mono mt-0.5 leading-none">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary of the Day */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Résumé de la journée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: 'Taux de complétion',
              value:
                data.rendez_vous_aujourd_hui > 0
                  ? Math.round((data.interventions_terminees / data.rendez_vous_aujourd_hui) * 100)
                  : 0,
              suffix: '%',
              color: 'bg-emerald-500',
            },
            {
              label: 'Charge de travail',
              value: data.rendez_vous_en_attente + data.interventions_en_cours,
              suffix: ' rdv actifs',
              color: 'bg-blue-500',
            },
            {
              label: 'Alertes (réclamations + véhicules)',
              value: data.reclamations_ouvertes + data.vehicules_a_valider,
              suffix: ' à traiter',
              color: 'bg-amber-500',
            },
          ].map((row) => (
            <div key={row.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-sm font-medium">{row.label}</p>
                <p className="text-white text-sm font-semibold">
                  {row.value}
                  {row.suffix}
                </p>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, row.value * (row.suffix === '%' ? 1 : 10))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
