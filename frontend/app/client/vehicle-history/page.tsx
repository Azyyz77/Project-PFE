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
  marque_nom: string;
  modele_nom: string;
  version_nom: string;
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
    v.marque_nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.modele_nom?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <ClientLoadingState message={t('common.loading')} />;

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-slate-800 shadow-sm border border-slate-200/80"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
              <History className="h-3.5 w-3.5 text-blue-500" />
              {t('vehicleHistory.detailTitle')}
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900">
              {t('vehicleHistory.title')}
            </h1>
            <p className="text-slate-500 font-semibold text-base leading-relaxed mb-8">
              {t('vehicleHistory.consultHistory')}
            </p>
            
            <div className="relative group max-w-md mx-auto md:mx-0">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder={t('catalog.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl pl-12 pr-6 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/50 outline-none transition-all w-full"
              />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 p-8 shadow-md rotate-3 border border-orange-300 flex items-center justify-center relative overflow-hidden">
               <History className="h-24 w-24 text-white opacity-20 absolute" />
               <Car className="h-16 w-16 text-white relative z-10" />            </div>
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
              actionLabel={t('vehicleHistory.addVehicle')}
              onAction={() => router.push('/client/vehicles/new')}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle, idx) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                layout
              >
                <ClientCard className="h-full flex flex-col p-0 overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                  {/* Vehicle Header Card */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-50 border-b border-slate-100 flex flex-col justify-center px-6">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                    
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Car className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wide text-blue-500 mb-0.5">{t('vehicles.vehicle')} {vehicle.annee}</p>
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                          {vehicle.marque_nom} {vehicle.modele_nom}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="px-3 py-1 rounded-full bg-slate-200/60 border border-slate-300/40 text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                        {vehicle.immatriculation}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wide">{t('vehicleHistory.mileage')}</span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-800">{vehicle.kilometrage?.toLocaleString() || 0} km</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                          <Zap className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wide">{t('vehicleHistory.status')}</span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-800">{vehicle.statut_validation || '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
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
        className="rounded-2xl bg-white p-8 border border-slate-200/80 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="h-20 w-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Info className="h-9 w-9 text-blue-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1.5 tracking-tight">{t('vehicleHistory.whatContainsTitle')}</h3>
            <p className="text-slate-500 font-semibold text-sm mb-6">{t('vehicleHistory.consultHistory')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { icon: Wrench, label: t('vehicleHistory.interventions') },
                 { icon: Clock, label: t('vehicleHistory.appointments') },
                 { icon: TrendingUp, label: t('vehicleHistory.rdvStats') },
                 { icon: History, label: t('nav.clientHistory') }
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
                    <item.icon className="h-4.5 w-4.5 text-blue-500" />
                    <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">{item.label}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>
    </ClientPageWrapper>
  );
}

