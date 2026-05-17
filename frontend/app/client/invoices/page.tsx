'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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

export default function ClientInvoicesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, token, isLoading } = useAuth();
  const [factures, setFactures] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const STATUS_COLORS: Record<InvoiceStatus, { bg: string; text: string; icon: any }> = {
    EMISE: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', icon: Clock },
    ENVOYEE: { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600', icon: Zap },
    PAYEE: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', icon: CheckCircle },
    ANNULEE: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-500', icon: XCircle },
  };

  const STATUS_LABELS: Record<InvoiceStatus, string> = {
    EMISE: t('invoices.statusEmise'),
    ENVOYEE: t('invoices.statusEnvoyee'),
    PAYEE: t('invoices.statusPayee'),
    ANNULEE: t('invoices.statusAnnulee'),
  };

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
      setError(err.response?.data?.error || t('orders.loadingError') || 'Erreur lors du chargement');
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
      toast.success(t('invoices.downloadStarted'), { 
        description: t('invoices.downloadDescription').replace('{number}', numero) 
      });
    } catch (err: any) {
      toast.error(t('common.error') || 'Erreur', { 
        description: err.response?.data?.error || t('common.error') 
      });
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

  const formatDate = (dateStr: string) => {
    const localeMap: any = { fr: 'fr-FR', ar: 'ar-TN', en: 'en-US' };
    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading || !user || !token) {
    return <ClientLoadingState message={t('invoices.loading')} />;
  }

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-slate-800 border border-slate-200/80 shadow-sm"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-emerald-600/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
              <Receipt className="h-3.5 w-3.5" />
              {t('invoices.space')}
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900">
              {t('invoices.title')}
            </h1>
            <p className="text-slate-500 font-semibold text-base leading-relaxed">
              {t('invoices.managePayments')}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('invoices.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 py-3.5 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClientStatCard
          label={t('invoices.totalInvoices')}
          value={stats.total}
          icon={Receipt}
          iconColor="text-blue-500"
          className="bg-white border border-slate-200/80 shadow-sm"
        />
        <ClientStatCard
          label={t('invoices.paidInvoices')}
          value={stats.paid}
          icon={ShieldCheck}
          iconColor="text-emerald-500"
          className="bg-white border border-slate-200/80 shadow-sm"
        />
        <ClientStatCard
          label={t('invoices.pendingInvoices')}
          value={stats.pending}
          icon={Clock}
          iconColor="text-amber-500"
          className="bg-white border border-slate-200/80 shadow-sm"
        />
        <ClientStatCard
          label={t('invoices.totalExpenses')}
          value={`${stats.totalAmount.toFixed(3)} TND`}
          icon={TrendingUp}
          iconColor="text-blue-600"
          className="bg-white border border-slate-200/80 shadow-sm"
        />
      </div>

      {/* ─── Invoices List ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{t('invoices.billingHistory')}</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">{stats.paidAmount.toFixed(3)} {t('invoices.tndPaid')}</span>
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
                <div key={i} className="h-32 rounded-2xl bg-white animate-pulse border border-slate-200" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center bg-blue-50 rounded-2xl border border-blue-100"
            >
              <XCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-blue-600 font-extrabold">{error}</p>
              <ClientButton onClick={loadFactures} variant="secondary" className="mt-6">
                {t('invoices.retry')}
              </ClientButton>
            </motion.div>
          ) : filteredFactures.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ClientEmptyState
                icon={FileText}
                title={t('invoices.noInvoices')}
                description={searchTerm ? t('invoices.noMatchingInvoices') : t('invoices.noInvoicesYet')}
                className="bg-white border border-slate-200/80 shadow-sm"
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
                      className="group p-6 sm:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-blue-200 transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row items-center gap-6">
                        {/* Status Block */}
                        <div className="flex flex-col items-center justify-center h-24 w-24 rounded-xl bg-slate-50 border border-slate-200 group-hover:bg-blue-50/55 group-hover:border-blue-200 transition-colors shrink-0">
                          <StatusIcon className={`h-8 w-8 ${status.text} mb-1`} />
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{t('invoices.invoice')}</span>
                        </div>

                        {/* Invoice Info */}
                        <div className="flex-1 text-center lg:text-left">
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                            <span className="text-xl font-extrabold text-slate-800 tracking-tight font-mono">
                              {facture.numero}
                            </span>
                            <Badge className={`${status.bg} ${status.text} border rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider`}>
                              {STATUS_LABELS[facture.statut] || facture.statut}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('invoices.orderRef')}</p>
                              <p className="font-extrabold text-slate-600">{facture.commande_numero}</p>
                              <p className="text-xs text-slate-400 font-bold">{facture.vehicule_immatriculation}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('invoices.issueDate')}</p>
                              <p className="font-extrabold text-slate-600">{formatDate(facture.date_emission)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('invoices.ttcAmount')}</p>
                              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                {facture.montant_ttc.toFixed(3)}
                                <span className="text-[10px] ml-1 text-slate-400 uppercase tracking-wider">TND</span>
                              </p>
                            </div>
                          </div>
                          
                          {facture.date_paiement && (
                            <div className="mt-4 flex items-center justify-center lg:justify-start gap-2">
                               <CheckCircle className="h-4 w-4 text-emerald-500" />
                               <span className="text-xs font-extrabold text-emerald-600">
                                 {t('invoices.paidOn')} {formatDate(facture.date_paiement)}
                               </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto">
                          <ClientButton
                            variant="secondary"
                            onClick={() => router.push(`/client/invoices/${facture.id}`)}
                            icon={Eye}
                            className="w-full sm:w-auto rounded-xl text-xs"
                          >
                            {t('invoices.view')}
                          </ClientButton>
                          <ClientButton
                            variant="primary"
                            onClick={() => handleDownloadPDF(facture.id, facture.numero)}
                            icon={Download}
                            className="w-full sm:w-auto rounded-xl text-xs"
                          >
                            {t('invoices.downloadPDF')}
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
