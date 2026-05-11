'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Car,
  MapPin,
  Calendar,
  Tool,
  Wrench,
  Package,
  ShieldCheck,
  CreditCard,
  Zap,
  XCircle
} from 'lucide-react';

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

export default function ClientRepairOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [commande, setCommande] = useState<RepairOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user || !token || loading) {
    return <ClientLoadingState message="Chargement des détails de la commande..." />;
  }

  if (error || !commande) {
    return (
      <ClientPageWrapper className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 text-center bg-red-50 rounded-[3rem] border border-red-100 max-w-xl w-full"
        >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-red-700 mb-2">Erreur</h2>
          <p className="text-red-600 font-medium">{error || 'Commande non trouvée'}</p>
          <ClientButton onClick={() => router.back()} variant="secondary" className="mt-8" icon={ArrowLeft}>
            Retour
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
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-red-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl text-left">
            <ClientButton 
              variant="outline" 
              onClick={() => router.back()} 
              icon={ArrowLeft}
              className="mb-8 bg-white/5 border-white/10 text-white hover:bg-white/10"
              size="small"
            >
              Retour
            </ClientButton>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-mono">
                #{commande.numero}
              </h1>
              <Badge className={`${status.bg} ${status.text} rounded-full border-none px-4 py-1.5 text-xs font-black uppercase tracking-widest`}>
                {STATUS_LABELS[commande.statut] || commande.statut}
              </Badge>
            </div>
            
            <p className="text-slate-400 font-medium text-lg leading-relaxed flex items-center gap-2">
              <Car className="h-5 w-5 text-red-500" />
              {commande.immatriculation} - {commande.marque_nom} {commande.modele_nom}
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl w-full md:w-auto">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant Total</p>
              <p className="text-4xl font-black text-white">{commande.montant_total?.toFixed(2) || '0.00'}</p>
              <p className="text-[10px] font-bold text-slate-500">TND</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Grid Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Information) */}
        <div className="lg:col-span-1 space-y-8">
          <ClientCard>
            <ClientCardHeader title="Informations Véhicule" />
            <ClientCardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                    <Car className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plaque</p>
                    <p className="text-lg font-black text-slate-800">{commande.immatriculation}</p>
                  </div>
                </div>
                <div className="pl-16">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modèle</p>
                  <p className="font-bold text-slate-700">{commande.marque_nom} {commande.modele_nom}</p>
                </div>
                <div className="pl-16">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Châssis</p>
                  <p className="font-mono text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg inline-block border border-slate-100">{commande.numero_chassis}</p>
                </div>
              </div>
            </ClientCardContent>
          </ClientCard>

          <ClientCard>
            <ClientCardHeader title="Agence SAV" />
            <ClientCardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Centre</p>
                    <p className="text-base font-bold text-slate-800">{commande.agence_nom}</p>
                  </div>
                </div>
                {commande.agence_adresse && (
                  <div className="pl-16">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adresse</p>
                    <p className="font-medium text-slate-600 text-sm leading-relaxed">{commande.agence_adresse}</p>
                  </div>
                )}
                {commande.agence_telephone && (
                  <div className="pl-16">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone</p>
                    <p className="font-medium text-slate-600">{commande.agence_telephone}</p>
                  </div>
                )}
              </div>
            </ClientCardContent>
          </ClientCard>

          {(commande.date_creation || commande.date_debut || commande.date_fin) && (
            <ClientCard>
              <ClientCardHeader title="Vérification Temporelle" />
              <ClientCardContent>
                <div className="space-y-4">
                  {commande.date_creation && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Création</p>
                      <p className="font-bold text-slate-800">{new Date(commande.date_creation).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                  {commande.date_debut && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Démarrage</p>
                      <p className="font-bold text-slate-800">{new Date(commande.date_debut).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                  {commande.date_fin && (
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clôture</p>
                      <p className="font-bold text-slate-800">{new Date(commande.date_fin).toLocaleDateString('fr-FR')}</p>
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
                <div className="h-16 w-16 rounded-[2rem] bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                  <StatusIcon className={`h-8 w-8 ${status.text}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-black mb-1 ${status.text}`}>{STATUS_LABELS[commande.statut]}</h3>
                  <p className="text-slate-600 font-medium">
                    {commande.statut === 'BROUILLON' && 'Votre ordre de réparation est en cours de préparation.'}
                    {commande.statut === 'EN_COURS' && 'Nos techniciens travaillent actuellement sur votre véhicule.'}
                    {commande.statut === 'TERMINEE' && 'Les travaux sur votre véhicule sont terminés.'}
                    {commande.statut === 'FACTUREE' && 'L\'intervention est facturée et terminée.'}
                    {commande.statut === 'ANNULEE' && 'Cette intervention a été annulée.'}
                  </p>
                </div>
              </div>
            </ClientCardContent>
          </ClientCard>

          {/* Travaux Overview */}
          <ClientCard>
            <ClientCardHeader title="Détail des Travaux & Pièces" />
            <ClientCardContent>
              {commande.lignes.length === 0 ? (
                <ClientEmptyState 
                  icon={Wrench} 
                  title="Aucun détail" 
                  description="Les détails de l'intervention ne sont pas encore disponibles." 
                  className="bg-slate-50 border border-slate-100 rounded-3xl"
                />
              ) : (
                <div className="space-y-4">
                  {commande.lignes.map((ligne, idx) => (
                    <motion.div
                      key={ligne.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                          ligne.type === 'INTERVENTION' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          {ligne.type === 'INTERVENTION' ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 mb-1">{ligne.description}</p>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`border-none px-2 py-0.5 text-[10px] uppercase font-black tracking-widest ${
                              ligne.type === 'INTERVENTION' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {ligne.type === 'INTERVENTION' ? 'Main d\'œuvre' : 'Pièce'}
                            </Badge>
                            <span className="text-xs font-bold text-slate-400">
                              Qté: {ligne.quantite} × {ligne.prix_unitaire.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="sm:text-right pt-4 sm:pt-0 border-t border-slate-50 sm:border-none">
                        <p className="text-xl font-black text-slate-800">{ligne.prix_total.toFixed(2)}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TND</p>
                      </div>
                    </motion.div>
                  ))}

                  <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-800">Total à payer</p>
                      <p className="text-xs font-medium text-slate-500">Montant incluant la TVA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-red-600 tracking-tight">
                        {commande.montant_total?.toFixed(2) || '0.00'} <span className="text-sm text-slate-400">TND</span>
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

