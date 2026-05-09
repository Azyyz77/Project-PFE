'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { repairOrdersApi } from '@/lib/api/repairOrders';
import type { RepairOrderSummary, RepairOrderStatus } from '@/types/repairOrder';
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  History,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS: Record<RepairOrderStatus, { bg: string; text: string; icon: any }> = {
  BROUILLON: { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertCircle },
  EN_COURS: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  TERMINEE: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
  FACTUREE: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CreditCard },
  ANNULEE: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

const STATUS_LABELS: Record<RepairOrderStatus, string> = {
  BROUILLON: 'En préparation',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  FACTUREE: 'Facturée',
  ANNULEE: 'Annulée',
};

export default function ClientRepairOrdersPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [commandes, setCommandes] = useState<RepairOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CLIENT')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && token) {
      loadCommandes();
    }
  }, [user, token]);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repairOrdersApi.getMyOrders();
      setCommandes(data);
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user || !token) {
    return <ClientLoadingState message="Chargement de vos commandes..." />;
  }

  const stats = {
    total: commandes.length,
    active: commandes.filter(c => c.statut === 'EN_COURS').length,
    completed: commandes.filter(c => c.statut === 'TERMINEE' || c.statut === 'FACTUREE').length,
    totalSpent: commandes.reduce((acc, c) => acc + (c.montant_total || 0), 0)
  };

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-red-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 backdrop-blur-md border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              Historique des Réparations
            </div>
            <h1 className="mb-4 text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Vos <span className="text-red-500">Commandes</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Consultez le détail de vos interventions SAV, l'état d'avancement de vos réparations et vos factures.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center h-40 w-40 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dépenses</p>
              <p className="text-2xl font-black text-white">{stats.totalSpent.toFixed(2)}</p>
              <p className="text-[10px] font-bold text-slate-500">TND</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClientStatCard
          label="Total Interventions"
          value={stats.total}
          icon={History}
          iconColor="text-blue-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
        <ClientStatCard
          label="En Cours"
          value={stats.active}
          icon={Zap}
          iconColor="text-amber-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
        <ClientStatCard
          label="Terminées"
          value={stats.completed}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
      </div>

      {/* ─── Orders List ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historique des ordres</h2>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{commandes.length} Interventions</span>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-[2rem] bg-white animate-pulse shadow-sm" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center bg-red-50 rounded-[3rem] border border-red-100"
            >
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-bold">{error}</p>
              <ClientButton onClick={loadCommandes} variant="secondary" className="mt-6">Réessayer</ClientButton>
            </motion.div>
          ) : commandes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ClientEmptyState
                icon={FileText}
                title="Aucune intervention"
                description="Vous n'avez pas encore d'historique de réparation pour vos véhicules."
                className="bg-white border-none shadow-2xl shadow-slate-100"
              />
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {commandes.map((commande, idx) => {
                const status = STATUS_COLORS[commande.statut] || STATUS_COLORS.BROUILLON;
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={commande.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ClientCard 
                      className="group cursor-pointer p-6 sm:p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border-none shadow-xl shadow-slate-100"
                      onClick={() => router.push(`/client/repair-orders/${commande.id}`)}
                    >
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Status Block */}
                        <div className="flex flex-col items-center justify-center h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
                          <StatusIcon className={`h-8 w-8 ${status.text} mb-1`} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Statut</span>
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 text-center lg:text-left">
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                            <span className="text-xl font-black text-slate-800 tracking-tight font-mono">
                              #{commande.numero}
                            </span>
                            <Badge className={`${status.bg} ${status.text} rounded-full border-none px-4 py-1 text-[10px] font-black uppercase tracking-widest`}>
                              {STATUS_LABELS[commande.statut] || commande.statut}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Véhicule</p>
                              <p className="font-bold text-slate-700">{commande.immatriculation}</p>
                              <p className="text-xs text-slate-400 font-medium">{commande.marque_nom} {commande.modele_nom}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Localisation</p>
                              <p className="font-bold text-slate-700">{commande.agence_nom}</p>
                              <p className="text-xs text-slate-400 font-medium">Agence SAV</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Date Intervention</p>
                              <p className="font-bold text-slate-700">{new Date(commande.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Action */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50 w-full lg:w-auto">
                          <div className="text-center lg:text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Montant Total</p>
                            <p className="text-2xl font-black text-slate-800 tracking-tight">
                              {commande.montant_total?.toFixed(3)}
                              <span className="text-[10px] ml-1 text-slate-400 uppercase tracking-widest">TND</span>
                            </p>
                          </div>
                          
                          <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-blue-500/30">
                            <ChevronRight className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                    </ClientCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </ClientPageWrapper>
  );
}
