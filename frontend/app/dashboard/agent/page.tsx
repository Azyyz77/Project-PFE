'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  AgentPageWrapper,
  AgentPageHeader,
  AgentButton,
  AgentCard,
  AgentCardHeader,
  AgentCardContent,
  AgentLoadingState,
  AgentStatCard,
  AgentErrorState,
  AgentEmptyState,
} from '@/components/agent';
import { fetchSummary } from '@/lib/api/agentDashboard';
import { DashboardSummary } from '@/types/agentDashboard';
import {
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Car,
  Users,
  ClipboardList,
  Activity,
  Zap,
  Target,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Protection de la route
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'AGENT')) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Chargement des données
  useEffect(() => {
    if (token && user?.role === 'AGENT') {
      loadSummary();
    }
  }, [token, user]);

  const loadSummary = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSummary();
      setSummaryData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  // États de chargement
  if (authLoading || !user || !token) {
    return <AgentLoadingState />;
  }

  if (loading) {
    return <AgentLoadingState message="Chargement du tableau de bord..." />;
  }

  if (error) {
    return (
      <AgentPageWrapper>
        <AgentErrorState
          message={error}
          onRetry={loadSummary}
          onBack={() => router.push('/login')}
        />
      </AgentPageWrapper>
    );
  }

  if (!summaryData) {
    return (
      <AgentPageWrapper>
        <AgentEmptyState
          icon={Activity}
          title="Aucune donnée disponible"
          description="Impossible de charger les données du tableau de bord"
          actionLabel="Réessayer"
          onAction={loadSummary}
        />
      </AgentPageWrapper>
    );
  }

  // Calcul des métriques
  const totalTasks = summaryData.rendez_vous_en_attente + summaryData.interventions_en_cours;
  const completionRate = summaryData.rendez_vous_aujourd_hui > 0
    ? Math.round((summaryData.interventions_terminees / summaryData.rendez_vous_aujourd_hui) * 100)
    : 0;
  const alertsCount = summaryData.reclamations_ouvertes + summaryData.vehicules_a_valider;

  return (
    <AgentPageWrapper className="space-y-10 pb-20">
      {/* ─── Modern Welcome Banner ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-16 text-white shadow-2xl"
      >
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 backdrop-blur-md border border-white/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Agent SAV
            </motion.div>
            <h1 className="mb-6 text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Bonjour, <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">{user.prenom}</span>
            </h1>
            <p className="mb-10 text-lg text-slate-400 font-medium leading-relaxed">
              Gérez vos rendez-vous, interventions et clients en toute efficacité. Votre tableau de bord centralisé pour un service optimal.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link href="/dashboard/agent/appointments">
                <AgentButton variant="primary" icon={Calendar} size="large">
                  Rendez-vous
                </AgentButton>
              </Link>
              <Link href="/dashboard/agent/clients">
                <AgentButton variant="outline" icon={Users} size="large" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Mes Clients
                </AgentButton>
              </Link>
            </div>
          </div>

          {/* Decorative Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-10 rounded-full bg-blue-600/20 blur-[60px] animate-pulse" />
            <div className="h-72 w-72 rounded-[4rem] border-2 border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl flex items-center justify-center p-8 shadow-inner">
              <Activity className="h-40 w-40 text-white opacity-20 absolute" />
              <div className="text-center">
                <span className="block text-5xl font-black text-white">{summaryData.rendez_vous_aujourd_hui}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">RDV Aujourd'hui</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Statistics Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AgentStatCard
          label="Rendez-vous aujourd'hui"
          value={summaryData.rendez_vous_aujourd_hui}
          icon={Calendar}
          iconColor="text-blue-600"
          subtitle="Planifiés"
        />
        <AgentStatCard
          label="En attente"
          value={summaryData.rendez_vous_en_attente}
          icon={Clock}
          iconColor="text-amber-500"
          subtitle="À traiter"
        />
        <AgentStatCard
          label="En cours"
          value={summaryData.interventions_en_cours}
          icon={Wrench}
          iconColor="text-violet-600"
          subtitle="Actives"
        />
        <AgentStatCard
          label="Terminées"
          value={summaryData.interventions_terminees}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          subtitle="Complétées"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ─── Performance Metrics ─── */}
        <div className="lg:col-span-2">
          <AgentCard>
            <AgentCardHeader
              title="Performance du Jour"
              subtitle="Indicateurs clés de performance"
            />
            <AgentCardContent>
              <div className="space-y-6">
                {/* Taux de complétion */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-slate-300 font-medium">Taux de complétion</p>
                    </div>
                    <p className="text-white text-lg font-bold font-mono">{completionRate}%</p>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-1000"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Charge de travail */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-slate-300 font-medium">Charge de travail active</p>
                    </div>
                    <p className="text-white text-lg font-bold font-mono">{totalTasks} tâches</p>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-600 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (totalTasks / 50) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Alertes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-slate-300 font-medium">Alertes à traiter</p>
                    </div>
                    <p className="text-white text-lg font-bold font-mono">{alertsCount} alertes</p>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (alertsCount / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AgentCardContent>
          </AgentCard>
        </div>

        {/* ─── Alerts & Quick Actions Sidebar ─── */}
        <div className="space-y-6">
          {/* Alertes */}
          <AgentCard>
            <AgentCardHeader title="Alertes" />
            <AgentCardContent>
              <div className="space-y-3">
                <Link href="/dashboard/agent/complaints">
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Réclamations</p>
                        <p className="text-2xl font-bold text-white font-mono">{summaryData.reclamations_ouvertes}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <Link href="/dashboard/agent/vehicles/validation">
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Véhicules</p>
                        <p className="text-2xl font-bold text-white font-mono">{summaryData.vehicules_a_valider}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            </AgentCardContent>
          </AgentCard>

          {/* Actions rapides */}
          <AgentCard>
            <AgentCardHeader title="Actions Rapides" />
            <AgentCardContent>
              <div className="grid gap-4">
                <Link href="/dashboard/agent/appointments" className="group">
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-blue-600 p-5 text-white shadow-lg shadow-blue-200 transition-all hover:translate-x-1 hover:shadow-blue-300">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider">Rendez-vous</p>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Gérer les RDV</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </Link>

                <Link href="/dashboard/agent/clients" className="group">
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-800 p-5 text-white shadow-lg shadow-slate-200 transition-all hover:translate-x-1 hover:shadow-slate-300">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider">Clients</p>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Gérer les clients</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </Link>

                <Link href="/dashboard/agent/catalog" className="group">
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-emerald-600 p-5 text-white shadow-lg shadow-emerald-200 transition-all hover:translate-x-1 hover:shadow-emerald-300">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider">Catalogue</p>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Services & pièces</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              </div>
            </AgentCardContent>
          </AgentCard>
        </div>
      </div>
    </AgentPageWrapper>
  );
}
