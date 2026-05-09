'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { invoicesApi } from '@/lib/api/invoices';
import type { InvoiceSummary, InvoiceStatus } from '@/types/invoice';
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
  Download, 
  Eye,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  History,
  TrendingUp,
  CreditCard,
  Receipt,
  SearchIcon,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STATUS_COLORS: Record<InvoiceStatus, { bg: string; text: string; icon: any }> = {
  EMISE: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  ENVOYEE: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Zap },
  PAYEE: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  ANNULEE: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  EMISE: 'Émise',
  ENVOYEE: 'Envoyée',
  PAYEE: 'Payée',
  ANNULEE: 'Annulée',
};

export default function ClientInvoicesPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [factures, setFactures] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CLIENT')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      loadFactures();
    }
  }, [token]);

  const loadFactures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getMyInvoices();
      setFactures(data);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: number, numero: string) => {
    try {
      const blob = await invoicesApi.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Téléchargement démarré', { description: `Facture ${numero} en cours de téléchargement.` });
    } catch (err: any) {
      toast.error('Erreur', { description: err.response?.data?.error || 'Erreur lors du téléchargement' });
    }
  };

  const filteredFactures = factures.filter(f => 
    f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.commande_numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: factures.length,
    paid: factures.filter(f => f.statut === 'PAYEE').length,
    pending: factures.filter(f => f.statut === 'EMISE' || f.statut === 'ENVOYEE').length,
    totalAmount: factures.reduce((sum, f) => sum + f.montant_ttc, 0),
    paidAmount: factures.filter(f => f.statut === 'PAYEE').reduce((sum, f) => sum + f.montant_ttc, 0),
    pendingAmount: factures.filter(f => f.statut === 'EMISE' || f.statut === 'ENVOYEE').reduce((sum, f) => sum + f.montant_ttc, 0)
  };

  if (isLoading || !user || !token) {
    return <ClientLoadingState message="Chargement de vos factures..." />;
  }

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md border border-white/10">
              <Receipt className="h-3.5 w-3.5" />
              Espace Facturation Chery
            </div>
            <h1 className="mb-4 text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Vos <span className="text-red-500">Factures</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Gérez votre historique de paiement, téléchargez vos factures PDF et suivez vos dépenses d'entretien.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all focus:bg-white/10 focus:ring-4 focus:ring-red-500/10"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClientStatCard
          label="Total Factures"
          value={stats.total}
          icon={Receipt}
          iconColor="text-blue-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
        <ClientStatCard
          label="Factures Payées"
          value={stats.paid}
          icon={ShieldCheck}
          iconColor="text-emerald-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
        <ClientStatCard
          label="En Attente"
          value={stats.pending}
          icon={Clock}
          iconColor="text-amber-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
        <ClientStatCard
          label="Total Dépenses"
          value={`${stats.totalAmount.toFixed(2)}`}
          icon={TrendingUp}
          iconColor="text-red-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
      </div>

      {/* ─── Invoices List ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historique de facturation</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.paidAmount.toFixed(3)} TND PAYÉS</span>
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
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-bold">{error}</p>
              <ClientButton onClick={loadFactures} variant="secondary" className="mt-6">Réessayer</ClientButton>
            </motion.div>
          ) : filteredFactures.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ClientEmptyState
                icon={FileText}
                title="Aucune facture"
                description={searchTerm ? "Aucun résultat pour votre recherche." : "Vous n'avez pas encore de factures émises."}
                className="bg-white border-none shadow-2xl shadow-slate-100"
              />
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredFactures.map((facture, idx) => {
                const status = STATUS_COLORS[facture.statut] || STATUS_COLORS.EMISE;
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={facture.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ClientCard 
                      className="group cursor-pointer p-6 sm:p-8 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border-none shadow-xl shadow-slate-100"
                    >
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Status Block */}
                        <div className="flex flex-col items-center justify-center h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors shrink-0">
                          <StatusIcon className={`h-8 w-8 ${status.text} mb-1`} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Facture</span>
                        </div>

                        {/* Invoice Info */}
                        <div className="flex-1 text-center lg:text-left">
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                            <span className="text-xl font-black text-slate-800 tracking-tight font-mono">
                              {facture.numero}
                            </span>
                            <Badge className={`${status.bg} ${status.text} rounded-full border-none px-4 py-1 text-[10px] font-black uppercase tracking-widest`}>
                              {STATUS_LABELS[facture.statut] || facture.statut}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Référence Commande</p>
                              <p className="font-bold text-slate-700">{facture.commande_numero}</p>
                              <p className="text-xs text-slate-400 font-medium">{facture.vehicule_immatriculation}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Date d'émission</p>
                              <p className="font-bold text-slate-700">{new Date(facture.date_emission).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Montant TTC</p>
                              <p className="text-2xl font-black text-slate-800 tracking-tight">
                                {facture.montant_ttc.toFixed(3)}
                                <span className="text-[10px] ml-1 text-slate-400 uppercase tracking-widest">TND</span>
                              </p>
                            </div>
                          </div>
                          
                          {facture.date_paiement && (
                            <div className="mt-4 flex items-center justify-center lg:justify-start gap-2">
                               <CheckCircle className="h-4 w-4 text-emerald-500" />
                               <span className="text-xs font-bold text-emerald-600">Payée le {new Date(facture.date_paiement).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50 w-full lg:w-auto">
                          <ClientButton
                            variant="secondary"
                            onClick={() => router.push(`/client/invoices/${facture.id}`)}
                            icon={Eye}
                            className="w-full sm:w-auto"
                          >
                            Consulter
                          </ClientButton>
                          <ClientButton
                            variant="primary"
                            onClick={() => handleDownloadPDF(facture.id, facture.numero)}
                            icon={Download}
                            className="w-full sm:w-auto"
                          >
                            Télécharger PDF
                          </ClientButton>
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
