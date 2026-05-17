'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { repairOrdersApi } from '@/lib/api/repairOrders';
import type { RepairOrder, RepairOrderStatus } from '@/types/repairOrder';
import {
  ClientPageWrapper,
  ClientCard,
  ClientCardHeader,
  ClientCardContent,
  ClientButton,
  ClientLoadingState,
  ClientEmptyState,
} from '@/components/client';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Car,
  MapPin,
  Wrench,
  Package,
  ShieldCheck,
  CreditCard,
  Zap,
  XCircle
} from 'lucide-react';

const STATUS_COLORS: Record<RepairOrderStatus, { bg: string; text: string; icon: any }> = {
  BROUILLON: { bg: 'bg-[#E4E6EB]', text: 'text-slate-700', icon: AlertCircle },
  EN_COURS: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  TERMINEE: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
  FACTUREE: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CreditCard },
  ANNULEE: { bg: 'bg-blue-100', text: 'text-blue-700', icon: XCircle },
};

export default function ClientRepairOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const { t } = useLanguage();
  const [commande, setCommande] = useState<RepairOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STATUS_LABELS: Record<RepairOrderStatus, string> = {
    BROUILLON: t('repairOrders.status.brouillon'),
    EN_COURS: t('repairOrders.status.enCours'),
    TERMINEE: t('repairOrders.status.terminee'),
    FACTUREE: t('repairOrders.status.facturee'),
    ANNULEE: t('repairOrders.status.annulee'),
  };

  const STATUS_DESCS: Record<RepairOrderStatus, string> = {
    BROUILLON: t('repairOrders.statusDesc.brouillon'),
    EN_COURS: t('repairOrders.statusDesc.enCours'),
    TERMINEE: t('repairOrders.statusDesc.terminee'),
    FACTUREE: t('repairOrders.statusDesc.facturee'),
    ANNULEE: t('repairOrders.statusDesc.annulee'),
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CLIENT')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (params.id && token) {
      loadCommande();
    }
  }, [params.id, token]);

  const loadCommande = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repairOrdersApi.getById(Number(params.id));
      setCommande(data);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || t('repairOrders.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user || !token || loading) {
    return <ClientLoadingState message={t('repairOrders.detailsLoading')} />;
  }

  if (error || !commande) {
    return (
      <ClientPageWrapper className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 text-center bg-blue-50 rounded-xl border border-blue-100 max-w-xl w-full"
        >
          <AlertCircle className="h-16 w-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-blue-700 mb-2">{t('repairOrders.error')}</h2>
          <p className="text-blue-600 font-medium">{error || t('repairOrders.notFound')}</p>
          <ClientButton onClick={() => router.back()} variant="secondary" className="mt-8" icon={ArrowLeft}>
            {t('repairOrders.back')}
          </ClientButton>
        </motion.div>
      </ClientPageWrapper>
    );
  }

  const status = STATUS_COLORS[commande.statut] || STATUS_COLORS.BROUILLON;
  const StatusIcon = status.icon;

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-[#050505] shadow-md border border-[#E4E6EB]"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-2xl text-left">
            <ClientButton 
              variant="outline" 
              onClick={() => router.back()} 
              icon={ArrowLeft}
              className="mb-8 bg-slate-100 hover:bg-slate-200 border-none text-[#050505]"
              size="small"
            >
              {t('repairOrders.back')}
            </ClientButton>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="text-4xl sm:text-3xl font-bold tracking-tight leading-none font-mono">
                #{commande.numero}
              </h1>
              <Badge className={`${status.bg} ${status.text} rounded-full border-none px-4 py-1.5 text-xs font-bold uppercase tracking-wide`}>
                {STATUS_LABELS[commande.statut] || commande.statut}
              </Badge>
            </div>
            
            <p className="text-[#65676B] font-medium text-lg leading-relaxed flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-500" />
              {commande.immatriculation} - {commande.marque_nom} {commande.modele_nom}
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center p-8 rounded-lg bg-slate-50 border border-slate-200 backdrop-blur-xl w-full md:w-auto">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide mb-1">{t('repairOrders.totalAmount')}</p>
              <p className="text-4xl font-bold text-[#050505]">{commande.montant_total?.toFixed(2) || '0.00'}</p>
              <p className="text-[10px] font-bold text-[#65676B]">TND</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Grid Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (Information) */}
        <div className="lg:col-span-1 space-y-8">
          <ClientCard>
            <ClientCardHeader title={t('repairOrders.vehicleInfo')} />
            <ClientCardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-[#F0F2F5] flex items-center justify-center shrink-0">
                    <Car className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.plaque')}</p>
                    <p className="text-lg font-bold text-[#050505]">{commande.immatriculation}</p>
                  </div>
                </div>
                <div className="pl-16">
                  <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.model')}</p>
                  <p className="font-bold text-slate-700">{commande.marque_nom} {commande.modele_nom}</p>
                </div>
                <div className="pl-16">
                  <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.chassis')}</p>
                  <p className="font-mono text-sm text-[#65676B] bg-[#F0F2F5] px-3 py-1.5 rounded-lg inline-block border border-[#E4E6EB]">{commande.numero_chassis}</p>
                </div>
              </div>
            </ClientCardContent>
          </ClientCard>

          <ClientCard>
            <ClientCardHeader title={t('repairOrders.agency')} />
            <ClientCardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-[#F0F2F5] flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.center')}</p>
                    <p className="text-base font-bold text-[#050505]">{commande.agence_nom}</p>
                  </div>
                </div>
                {commande.agence_adresse && (
                  <div className="pl-16">
                    <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.address')}</p>
                    <p className="font-medium text-[#65676B] text-sm leading-relaxed">{commande.agence_adresse}</p>
                  </div>
                )}
                {commande.agence_telephone && (
                  <div className="pl-16">
                    <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.phone')}</p>
                    <p className="font-medium text-[#65676B]">{commande.agence_telephone}</p>
                  </div>
                )}
              </div>
            </ClientCardContent>
          </ClientCard>

          {(commande.date_creation || commande.date_debut || commande.date_fin) && (
            <ClientCard>
              <ClientCardHeader title={t('repairOrders.timeTracking')} />
              <ClientCardContent>
                <div className="space-y-4">
                  {commande.date_creation && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <p className="text-xs font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.creation')}</p>
                      <p className="font-bold text-[#050505]">{new Date(commande.date_creation).toLocaleDateString(t('locale') === 'ar' ? 'ar-TN' : 'fr-FR')}</p>
                    </div>
                  )}
                  {commande.date_debut && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <p className="text-xs font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.start')}</p>
                      <p className="font-bold text-[#050505]">{new Date(commande.date_debut).toLocaleDateString(t('locale') === 'ar' ? 'ar-TN' : 'fr-FR')}</p>
                    </div>
                  )}
                  {commande.date_fin && (
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-[#65676B] uppercase tracking-wide">{t('repairOrders.close')}</p>
                      <p className="font-bold text-[#050505]">{new Date(commande.date_fin).toLocaleDateString(t('locale') === 'ar' ? 'ar-TN' : 'fr-FR')}</p>
                    </div>
                  )}
                </div>
              </ClientCardContent>
            </ClientCard>
          )}
        </div>

        {/* Right Column (Details) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Status Tracker */}
          <ClientCard className={`${status.bg} border-none`}>
            <ClientCardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="h-16 w-16 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#E4E6EB]">
                  <StatusIcon className={`h-8 w-8 ${status.text}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-1 ${status.text}`}>{STATUS_LABELS[commande.statut]}</h3>
                  <p className="text-[#65676B] font-medium">
                    {STATUS_DESCS[commande.statut] || commande.statut}
                  </p>
                </div>
              </div>
            </ClientCardContent>
          </ClientCard>

          {/* Travaux Overview */}
          <ClientCard>
            <ClientCardHeader title={t('repairOrders.worksAndParts')} />
            <ClientCardContent>
              {commande.lignes.length === 0 ? (
                <ClientEmptyState 
                  icon={Wrench} 
                  title={t('repairOrders.noDetails')} 
                  description={t('repairOrders.noDetailsDesc')} 
                  className="bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg"
                />
              ) : (
                <div className="space-y-4">
                  {commande.lignes.map((ligne, idx) => (
                    <motion.div
                      key={ligne.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-lg bg-white border border-[#E4E6EB] hover:border-[#E4E6EB] hover:shadow-sm hover:shadow-slate-100 transition-all gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                          ligne.type === 'INTERVENTION' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          {ligne.type === 'INTERVENTION' ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-[#050505] mb-1">{ligne.description}</p>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`border-none px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide ${
                              ligne.type === 'INTERVENTION' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {ligne.type === 'INTERVENTION' ? t('repairOrders.labor') : t('repairOrders.part')}
                            </Badge>
                            <span className="text-xs font-bold text-[#65676B]">
                              {t('repairOrders.qty')}: {ligne.quantite} × {ligne.prix_unitaire.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="sm:text-right pt-4 sm:pt-0 border-t border-slate-50 sm:border-none">
                        <p className="text-xl font-bold text-[#050505]">{ligne.prix_total.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">TND</p>
                      </div>
                    </motion.div>
                  ))}

                  <div className="mt-8 p-6 rounded-lg bg-[#F0F2F5] border border-[#E4E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#050505]">{t('repairOrders.totalToPay')}</p>
                      <p className="text-xs font-medium text-[#65676B]">{t('repairOrders.includingVat')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600 tracking-tight">
                        {commande.montant_total?.toFixed(2) || '0.00'} <span className="text-sm text-[#65676B]">TND</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </ClientCardContent>
          </ClientCard>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
