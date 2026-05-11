'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  vehicleHistoryAPI,
  VehicleHistory,
  VehicleIntervention,
  VehicleAppointment,
} from '@/lib/api/vehicleHistory';
import { 
  Download, 
  Calendar, 
  Wrench, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Car,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  History,
  Activity,
  DollarSign,
  AlertCircle,
  Sparkles,
  MapPin
} from 'lucide-react';
import {
  ClientPageWrapper,
  ClientButton,
  ClientCard,
  ClientStatCard,
  ClientLoadingState,
  ClientEmptyState,
} from '@/components/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function VehicleHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const vehicleId = parseInt(params.id as string);

  const [history, setHistory] = useState<VehicleHistory | null>(null);
  const [interventions, setInterventions] = useState<VehicleIntervention[]>([]);
  const [appointments, setAppointments] = useState<VehicleAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'interventions' | 'appointments'>('overview');

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [historyData, interventionsData, appointmentsData] = await Promise.all([
        vehicleHistoryAPI.getHistory(vehicleId),
        vehicleHistoryAPI.getInterventions(vehicleId, { limit: 100 }),
        vehicleHistoryAPI.getAppointments(vehicleId, { limit: 100 }),
      ]);

      setHistory(historyData);
      setInterventions(interventionsData.interventions);
      setAppointments(appointmentsData.appointments);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || t('vehicleHistory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await vehicleHistoryAPI.exportHistory(vehicleId, 'json');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historique-vehicule-${vehicleId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export réussi');
    } catch (err: any) {
      setError(t('vehicleHistory.exportError'));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3
    }).format(amount || 0);
  };

  if (loading) return <ClientLoadingState message="Chargement des archives du véhicule..." />;

  if (error || !history) {
    return (
      <ClientPageWrapper className="flex items-center justify-center h-[60vh]">
        <ClientCard className="max-w-md text-center p-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-4">{error || "Véhicule non trouvé"}</h2>
          <ClientButton onClick={() => router.back()} variant="secondary" icon={ChevronLeft}>
            {t('common.back')}
          </ClientButton>
        </ClientCard>
      </ClientPageWrapper>
    );
  }

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-red-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5" />
                Dossier Véhicule Sécurisé
              </div>
            </div>
            
            <h1 className="mb-2 text-4xl sm:text-6xl font-black tracking-tight leading-none">
              {history.marque} <span className="text-red-500">{history.modele}</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
              Historique complet • <span className="text-white font-bold">{history.immatriculation}</span> • Année {history.annee}
            </p>
            
            <ClientButton 
              onClick={handleExport}
              variant="primary" 
              size="large" 
              icon={Download}
            >
              Exporter les données
            </ClientButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
             <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                      <TrendingUp className="h-5 w-5 text-white" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kilométrage</span>
                </div>
                <p className="text-3xl font-black text-white">{history.kilometrage.toLocaleString()} <span className="text-sm font-bold text-slate-500">KM</span></p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <Activity className="h-5 w-5 text-white" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Services</span>
                </div>
                <p className="text-3xl font-black text-white">{history.total_interventions}</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Tabs Navigation ─── */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <TabsList className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-100 h-auto gap-2 border border-slate-50 self-start">
            <TabsTrigger value="overview" className="rounded-2xl px-8 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white">
              {t('vehicleHistory.overview')}
            </TabsTrigger>
            <TabsTrigger value="interventions" className="rounded-2xl px-8 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white">
              {t('vehicleHistory.interventions')} ({interventions.length})
            </TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-2xl px-8 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white">
              {t('vehicleHistory.appointments')} ({appointments.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW CONTENT */}
          <TabsContent key="overview" value="overview" className="space-y-10 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Detail Card */}
               <ClientCard className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <History className="h-7 w-7 text-slate-400" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Informations Générales</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiche technique du véhicule</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     {[
                       { icon: Car, label: t('vehicleHistory.brandModel'), value: `${history.marque} ${history.modele}` },
                       { icon: Calendar, label: t('vehicleHistory.year'), value: history.annee },
                       { icon: ShieldCheck, label: t('vehicleHistory.registration'), value: history.immatriculation },
                       { icon: Clock, label: t('vehicleHistory.purchaseDate'), value: formatDate(history.date_achat) },
                       { icon: Wrench, label: t('vehicleHistory.lastIntervention'), value: history.derniere_intervention ? formatDate(history.derniere_intervention) : t('vehicleHistory.none') },
                       { icon: Calendar, label: t('vehicleHistory.nextRDV'), value: history.prochain_rdv ? formatDate(history.prochain_rdv) : t('vehicleHistory.noneM') }
                     ].map((item, i) => (
                       <div key={i} className="group">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <item.icon className="h-3.5 w-3.5 text-red-500" />
                             {item.label}
                          </p>
                          <p className="text-lg font-black text-slate-800 group-hover:text-red-600 transition-colors">{item.value}</p>
                       </div>
                     ))}
                  </div>
               </ClientCard>

               {/* Cost Summary Card */}
               <ClientCard className="border-2 border-red-50 bg-red-50/10">
                  <div className="text-center space-y-6">
                     <div className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center mx-auto shadow-xl shadow-red-600/20">
                        <DollarSign className="h-10 w-10 text-white" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-800 mb-1">{t('vehicleHistory.totalCost')}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumul de toutes les interventions</p>
                     </div>
                     <p className="text-4xl font-black text-red-600 tracking-tight">
                        {formatCurrency(history.cout_total_interventions)}
                     </p>
                     <div className="pt-6 border-t border-red-100 grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rendez-vous</p>
                           <p className="text-xl font-black text-slate-800">{history.total_rdv}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interventions</p>
                           <p className="text-xl font-black text-slate-800">{history.total_interventions}</p>
                        </div>
                     </div>
                  </div>
               </ClientCard>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <ClientStatCard
                  label={t('vehicleHistory.completed')}
                  value={history.rdv_termines}
                  icon={CheckCircle}
                  iconColor="text-emerald-500"
               />
               <ClientStatCard
                  label={t('vehicleHistory.cancelled')}
                  value={history.rdv_annules}
                  icon={XCircle}
                  iconColor="text-red-500"
               />
               <ClientStatCard
                  label={t('vehicleHistory.inProgress')}
                  value={history.total_rdv - history.rdv_termines - history.rdv_annules}
                  icon={Clock}
                  iconColor="text-blue-500"
               />
            </div>
          </TabsContent>

          {/* INTERVENTIONS CONTENT */}
          <TabsContent key="interventions" value="interventions" className="outline-none">
            {interventions.length === 0 ? (
              <ClientEmptyState 
                icon={Wrench} 
                title={t('vehicleHistory.noInterventions')} 
                description="Aucune intervention enregistrée pour ce véhicule."
              />
            ) : (
              <div className="space-y-6">
                {interventions.map((intervention, idx) => (
                  <motion.div
                    key={intervention.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ClientCard className="p-0 overflow-hidden border-none shadow-xl shadow-slate-100 group">
                      <div className="flex flex-col lg:flex-row">
                        <div className="bg-slate-50 p-8 flex flex-col justify-center items-center text-center lg:w-48 border-b lg:border-b-0 lg:border-r border-slate-100 group-hover:bg-red-50 transition-colors">
                           <span className="text-3xl font-black text-slate-800 mb-1 leading-none">{new Date(intervention.date_intervention).getDate()}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(intervention.date_intervention).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex-1 p-8">
                           <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                              <div>
                                 <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">
                                       {intervention.type_intervention || 'Service'}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                       intervention.statut === 'TERMINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                       {intervention.statut}
                                    </span>
                                 </div>
                                 <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                                    <MapPin className="h-3.5 w-3.5" /> {intervention.agence_nom}
                                 </p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant Total</p>
                                 <p className="text-2xl font-black text-slate-800">{formatCurrency(intervention.cout_total)}</p>
                              </div>
                           </div>
                           <p className="text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 rounded-2xl p-5 italic">
                              "{intervention.description || 'Aucune description disponible.'}"
                           </p>
                        </div>
                      </div>
                    </ClientCard>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* APPOINTMENTS CONTENT */}
          <TabsContent key="appointments" value="appointments" className="outline-none">
            {appointments.length === 0 ? (
              <ClientEmptyState 
                icon={Calendar} 
                title={t('vehicleHistory.noAppointments')} 
                description="Aucun rendez-vous enregistré pour ce véhicule."
              />
            ) : (
              <div className="space-y-6">
                {appointments.map((appointment, idx) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ClientCard className="p-8 border-none shadow-xl shadow-slate-100 group">
                      <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="h-20 w-20 rounded-3xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                           <span className="text-2xl font-black text-slate-800 leading-none mb-1">{new Date(appointment.date_rdv).getDate()}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(appointment.date_rdv).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                           <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-2">
                              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                 {appointment.type_intervention || 'Rendez-vous'}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 appointment.statut === 'TERMINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                 appointment.statut === 'ANNULE' ? 'bg-red-50 text-red-600 border-red-100' :
                                 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                                 {appointment.statut}
                              </span>
                           </div>
                           <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {appointment.heure_debut} - {appointment.heure_fin}</span>
                              <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {appointment.agence_nom}</span>
                           </div>
                        </div>
                        <div className="max-w-xs text-center sm:text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motif</p>
                           <p className="text-sm font-bold text-slate-600 italic line-clamp-2">{appointment.motif || '—'}</p>
                        </div>
                      </div>
                    </ClientCard>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* ─── Export CTA ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="rounded-[3rem] bg-red-600 p-12 text-center relative overflow-hidden text-white"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10">
          <Sparkles className="h-12 w-12 text-white/40 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 tracking-tight">Besoin d'un dossier papier ?</h2>
          <p className="text-red-100 font-medium max-w-lg mx-auto mb-8">
            Vous pouvez exporter l'intégralité de l'historique de votre véhicule au format JSON pour vos archives personnelles ou pour le futur acquéreur.
          </p>
          <ClientButton 
            onClick={handleExport}
            variant="outline" 
            size="large" 
            className="bg-white text-red-600 hover:bg-red-50 border-none"
          >
            Télécharger l'historique
          </ClientButton>
        </div>
      </motion.div>
    </ClientPageWrapper>
  );
}
