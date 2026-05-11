'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Car, 
  History, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Search, 
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  Clock,
  Wrench
} from 'lucide-react';
import {
  ClientPageWrapper,
  ClientButton,
  ClientCard,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Vehicle {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  couleur?: string;
  statut_validation?: string;
}

export default function VehicleHistoryListPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        throw new Error(t('vehicleHistory.notConnected'));
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/vehicles/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('vehicleHistory.errorLoading'));
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.immatriculation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.marque?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.modele?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <ClientLoadingState message="Récupération de l'historique de vos véhicules..." />;

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-white shadow-md"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-400 backdrop-blur-md border border-white/10">
              <History className="h-3.5 w-3.5" />
              Archives Maintenance
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-bold tracking-tight leading-none">
              Historique <span className="text-blue-500">Véhicules</span>
            </h1>
            <p className="text-[#B0B3B8] font-medium text-lg leading-relaxed mb-8">
              Consultez le passé de vos véhicules STA Chery. Suivez chaque intervention, chaque entretien et gardez une trace précise de la vie de votre moteur.
            </p>
            
            <div className="relative group max-w-md mx-auto md:mx-0">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#8A8D91] group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="Chercher par immatriculation ou modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg pl-12 pr-6 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/20 focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all w-full"
              />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="h-48 w-48 rounded-xl bg-gradient-to-br from-red-600 to-red-400 p-8 shadow-md shadow-blue-500/20 rotate-3 border-4 border-white/10 flex items-center justify-center">
               <History className="h-24 w-24 text-white opacity-40 absolute" />
               <Car className="h-16 w-16 text-white relative z-10" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Vehicles Selection Grid ─── */}
      <AnimatePresence mode="popLayout">
        {filteredVehicles.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ClientEmptyState
              icon={Car}
              title={t('vehicleHistory.noVehicles')}
              description={t('vehicleHistory.addVehicleToConsult')}
              action={
                <ClientButton variant="primary" onClick={() => router.push('/client/vehicles/new')}>
                  {t('vehicleHistory.addVehicle')}
                </ClientButton>
              }
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle, idx) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                layout
              >
                <ClientCard className="h-full flex flex-col p-0 overflow-hidden border-none shadow-sm shadow-slate-200/40 group">
                  {/* Vehicle Header Card */}
                  <div className="relative h-40 w-full overflow-hidden bg-white">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
                    
                    <div className="absolute top-6 left-8 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Car className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-blue-400 mb-1">Année {vehicle.annee}</p>
                        <h3 className="text-xl font-bold text-white tracking-tight leading-none">
                          {vehicle.marque} {vehicle.modele}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-6 left-8">
                      <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                        {vehicle.immatriculation}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-[#F0F2F5] border border-[#E4E6EB]">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">{t('vehicleHistory.mileage')}</span>
                        </div>
                        <p className="text-sm font-bold text-[#050505]">{vehicle.kilometrage?.toLocaleString() || 0} km</p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#F0F2F5] border border-[#E4E6EB]">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">État</span>
                        </div>
                        <p className="text-sm font-bold text-[#050505]">{vehicle.statut_validation || '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <ClientButton
                        onClick={() => router.push(`/client/vehicles/${vehicle.id}/history`)}
                        variant="primary"
                        fullWidth
                        size="large"
                        icon={ArrowRight}
                      >
                        {t('vehicleHistory.viewHistory')}
                      </ClientButton>
                    </div>
                  </div>
                </ClientCard>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ─── Information Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-[#F0F2F5] p-10 border border-[#E4E6EB] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="h-24 w-24 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-[#E4E6EB]">
            <Info className="h-10 w-10 text-blue-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-[#050505] mb-2 tracking-tight">Que contient votre historique ?</h3>
            <p className="text-[#8A8D91] font-medium mb-6">Un dossier complet pour la valeur de revente et la sécurité de votre véhicule.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { icon: Wrench, label: "Interventions" },
                 { icon: Clock, label: "Rendez-vous" },
                 { icon: TrendingUp, label: "Statistiques" },
                 { icon: History, label: "Archives" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-[#E4E6EB]">
                   <item.icon className="h-4 w-4 text-blue-500" />
                   <span className="text-xs font-bold text-[#65676B] uppercase tracking-wide">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>
    </ClientPageWrapper>
  );
}
