'use client';
/**
 * DashboardSummary — Dashboard Agent SAV Premium
 * Design professionnel avec animations et visualisations avancées
 */
import { useState } from 'react';
import { DashboardSummary as Summary } from '@/types/agentDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RefreshCw, 
  Calendar, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Car,
  TrendingUp,
  Users,
  ClipboardList,
  ArrowRight,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  data: Summary;
  onRefresh: () => void;
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

  // Calcul des métriques
  const totalTasks = data.rendez_vous_en_attente + data.interventions_en_cours;
  const completionRate = data.rendez_vous_aujourd_hui > 0
    ? Math.round((data.interventions_terminees / data.rendez_vous_aujourd_hui) * 100)
    : 0;
  const alertsCount = data.reclamations_ouvertes + data.vehicules_a_valider;

  // Cartes KPI principales
  const mainKpis = [
    {
      label: "Rendez-vous aujourd'hui",
      value: data.rendez_vous_aujourd_hui,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      trend: '+12%',
      link: '/dashboard/agent/appointments'
    },
    {
      label: 'En attente',
      value: data.rendez_vous_en_attente,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      trend: '-5%',
      link: '/dashboard/agent/appointments'
    },
    {
      label: 'En cours',
      value: data.interventions_en_cours,
      icon: Wrench,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      trend: '+8%',
      link: '/dashboard/agent/interventions'
    },
    {
      label: 'Terminées',
      value: data.interventions_terminees,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      trend: '+15%',
      link: '/dashboard/agent/interventions'
    },
  ];

  // Alertes et actions
  const alerts = [
    {
      label: 'Réclamations ouvertes',
      value: data.reclamations_ouvertes,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      link: '/dashboard/agent/complaints'
    },
    {
      label: 'Véhicules à valider',
      value: data.vehicules_a_valider,
      icon: Car,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      link: '/dashboard/agent/vehicles/validation'
    },
  ];

  // Actions rapides
  const quickActions = [
    { label: 'Nouveau RDV', icon: Calendar, link: '/dashboard/agent/appointments', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Mes Clients', icon: Users, link: '/dashboard/agent/clients', color: 'bg-violet-600 hover:bg-violet-700' },
    { label: 'Catalogue', icon: ClipboardList, link: '/dashboard/agent/catalog', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Statistiques', icon: Activity, link: '/dashboard/agent/statistics', color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec gradient animé */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 border border-slate-700/50">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-emerald-500/5 animate-pulse" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-violet-100 bg-clip-text text-transparent">
                  Tableau de Bord Agent SAV
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  {new Intl.DateTimeFormat('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(data.timestamp || Date.now()))}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Métriques rapides */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Target className="w-3 h-3" />
              Taux de complétion
            </div>
            <div className="text-2xl font-bold text-white">{completionRate}%</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Activity className="w-3 h-3" />
              Charge de travail
            </div>
            <div className="text-2xl font-bold text-white">{totalTasks}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <AlertTriangle className="w-3 h-3" />
              Alertes
            </div>
            <div className="text-2xl font-bold text-white">{alertsCount}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Design moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {mainKpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Link href={kpi.link} key={kpi.label}>
              <Card className="group relative overflow-hidden bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer h-full">
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${kpi.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                      <TrendingUp className="w-3 h-3" />
                      {kpi.trend}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-slate-400 text-sm font-medium">{kpi.label}</p>
                    <p className="text-4xl font-bold text-white font-mono">{kpi.value}</p>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${kpi.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (kpi.value / 20) * 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Alertes et Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <Link href={alert.link} key={alert.label}>
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${alert.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${alert.color}`} />
                      </div>
                      <div>
                        <p className="text-slate-300 text-sm font-medium">{alert.label}</p>
                        <p className="text-2xl font-bold text-white font-mono">{alert.value}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link href={action.link} key={action.label}>
                    <Button
                      className={`w-full h-24 ${action.color} text-white shadow-lg hover:shadow-xl transition-all group relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <Icon className="w-6 h-6" />
                        <span className="font-semibold">{action.label}</span>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résumé détaillé */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-500" />
            Performance du Jour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              label: 'Taux de complétion',
              value: completionRate,
              max: 100,
              suffix: '%',
              color: 'from-emerald-500 to-green-600',
              icon: Target,
            },
            {
              label: 'Charge de travail active',
              value: totalTasks,
              max: 50,
              suffix: ' tâches',
              color: 'from-blue-500 to-violet-600',
              icon: Activity,
            },
            {
              label: 'Alertes à traiter',
              value: alertsCount,
              max: 20,
              suffix: ' alertes',
              color: 'from-amber-500 to-orange-600',
              icon: AlertTriangle,
            },
          ].map((metric) => {
            const Icon = metric.icon;
            const percentage = Math.min(100, (metric.value / metric.max) * 100);
            
            return (
              <div key={metric.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-slate-300 font-medium">{metric.label}</p>
                  </div>
                  <p className="text-white text-lg font-bold font-mono">
                    {metric.value}{metric.suffix}
                  </p>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                      style={{ width: `${percentage}%` }}
                    >
                      {/* Effet de brillance animé */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>0</span>
                    <span>{metric.max}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

