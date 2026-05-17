'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getVehiclesByUser, deleteVehicle } from '@/lib/api/vehicles';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClientPageWrapper,
  ClientButton,
  ClientCard,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Car, 
  CheckCircle2, 
  Clock3, 
  AlertTriangle,
  ShieldCheck,
  Zap,
  ChevronRight,
  Shield,
  Search,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientVehiclesPage() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user || !token) return;
      try {
        setIsLoading(true);
        const data = await getVehiclesByUser(user.id, token);
        setVehicles(data);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, token]);

  const handleDelete = async (vehicleId: number) => {
    if (!token) return;
    
    if (!confirm(t('vehicles.confirmDelete'))) {
      return;
    }

    setDeletingId(vehicleId);
    try {
      await deleteVehicle(vehicleId, token);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success(t('vehicles.deleteSuccess'));
    } catch (error: any) {
      console.error('Failed to delete vehicle:', error);
      toast.error(t('common.error') || 'Erreur', { description: error.message || t('vehicles.deleteError') });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return vehicles;
    const lowerQuery = searchQuery.toLowerCase();
    return vehicles.filter(v => 
      v.immatriculation?.toLowerCase().includes(lowerQuery) ||
      v.marque_nom?.toLowerCase().includes(lowerQuery) ||
      v.modele_nom?.toLowerCase().includes(lowerQuery)
    );
  }, [vehicles, searchQuery]);

  const stats = useMemo(() => ({
    total: vehicles.length,
    validated: vehicles.filter(v => v.statut_validation === 'VALIDE').length,
    pending: vehicles.filter(v => v.statut_validation === 'EN_ATTENTE').length,
  }), [vehicles]);

  if (isLoading) return <ClientLoadingState message={t('vehicles.loadingPersonalGarage')} />;

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-slate-800 border border-slate-200/80 shadow-sm"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('vehicles.personalGarage')}
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900">
              {t('vehicles.title')}
            </h1>
            <p className="text-slate-500 font-semibold text-base leading-relaxed mb-8">
              {t('vehicles.manageFleet')}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link href="/client/vehicles/new">
                <ClientButton variant="primary" size="large" icon={Plus}>
                  {t('vehicles.addVehicle')}
                </ClientButton>
              </Link>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text"
                  placeholder={t('vehicles.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-6 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/50 outline-none transition-all w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Stats Summary In Header */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[120px] shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">{t('vehicles.total')}</p>
              <p className="text-3xl font-extrabold text-slate-800 leading-none">{stats.total}</p>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center min-w-[120px] shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 mb-1">{t('vehicles.validated')}</p>
              <p className="text-3xl font-extrabold text-emerald-600 leading-none">{stats.validated}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Vehicles List ─── */}
      <AnimatePresence mode="popLayout">
        {filteredVehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ClientEmptyState
              icon={Car}
              title={searchQuery ? t('vehicles.noVehiclesFound') : t('vehicles.noVehicles')}
              description={searchQuery ? t('vehicles.tryAnotherSearch') : t('vehicles.noVehiclesRegistered')}
              {...(!searchQuery ? {
                actionLabel: t('vehicles.addVehicle'),
                onAction: () => router.push('/client/vehicles/new')
              } : {})}
              className="bg-white border border-slate-200 shadow-sm"
            />
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Vehicles List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {filteredVehicles.map((vehicle, idx) => {
                const status = vehicle.statut_validation || 'EN_ATTENTE';
                const isValide = status === 'VALIDE';
                const isRefuse = status === 'REFUSE';
                
                const vehicleName = [vehicle.marque_nom, vehicle.modele_nom, vehicle.version_nom]
                  .filter(Boolean)
                  .join(' ');

                const mileage = vehicle.kilometrage ?? vehicle.kilometrage_actuel ?? vehicle.kilometrage_km;

                return (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className={`flex items-center gap-4 p-5 hover:bg-slate-50 transition-all duration-200 ${
                      idx !== filteredVehicles.length - 1 ? 'border-b border-slate-100' : ''
                    }`}>
                      {/* Vehicle Icon with Status */}
                      <div className="relative shrink-0">
                        <div className={`h-16 w-16 rounded-xl flex items-center justify-center border ${
                          isValide ? 'bg-blue-50 border-blue-100' : isRefuse ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                        }`}>
                          <Car className={`h-8 w-8 ${
                            isValide ? 'text-blue-600' : isRefuse ? 'text-red-500' : 'text-amber-500'
                          }`} />
                        </div>
                        {/* Status Badge */}
                        <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center ${
                          isValide ? 'bg-emerald-500' : isRefuse ? 'bg-red-500' : 'bg-amber-500'
                        }`}>
                          {isValide ? (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          ) : isRefuse ? (
                            <AlertTriangle className="h-3 w-3 text-white" />
                          ) : (
                            <Clock3 className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-extrabold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                              {vehicleName || t('vehicles.vehicle')}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-bold text-slate-500 font-mono">
                                {vehicle.immatriculation}
                              </span>
                              <span className="text-xs text-slate-300">•</span>
                              <span className={`text-xs font-extrabold uppercase tracking-wide ${
                                isValide ? 'text-emerald-600' : isRefuse ? 'text-red-500' : 'text-amber-500'
                              }`}>
                                {isValide ? t('vehicles.statusValide') : isRefuse ? t('vehicles.statusRefuse') : t('vehicles.statusEnAttente')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                          {mileage && (
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-500">{Number(mileage).toLocaleString('fr-FR')} km</span>
                            </div>
                          )}
                          {vehicle.motorisation && (
                            <div className="flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-500">{vehicle.motorisation}</span>
                            </div>
                          )}
                          {vehicle.annee && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-500">{vehicle.annee}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <Link href={`/client/vehicles/${vehicle.id}/history`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wide transition-colors"
                          >
                            {t('vehicles.history')}
                          </motion.button>
                        </Link>
                        <Link href="/client/rendez-vous">
                          <motion.button
                            whileHover={isValide ? { scale: 1.02 } : {}}
                            whileTap={isValide ? { scale: 0.98 } : {}}
                            disabled={!isValide}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide border transition-all ${
                              isValide
                                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            {t('vehicles.bookService')}
                          </motion.button>
                        </Link>
                        <Link href={`/client/vehicles/${vehicle.id}/edit`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={deletingId === vehicle.id}
                          className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>

                      {/* Mobile Chevron */}
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="sm:hidden text-slate-400"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.div>
                    </div>

                    {/* Mobile Actions (Expandable) */}
                    <div className="sm:hidden px-4 pb-4 pt-2 bg-[#F0F2F5]/50 border-b border-slate-200">
                      <div className="flex gap-2">
                        <Link href={`/client/vehicles/${vehicle.id}/history`} className="flex-1">
                          <button className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide">
                            {t('vehicles.history')}
                          </button>
                        </Link>
                        <Link href="/client/rendez-vous" className="flex-1">
                          <button
                            disabled={!isValide}
                            className={`w-full px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide ${
                              isValide
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-50 border border-slate-200 text-slate-300'
                            }`}
                          >
                            {t('vehicles.bookService')}
                          </button>
                        </Link>
                        <Link href={`/client/vehicles/${vehicle.id}/edit`}>
                          <button className="px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-500">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={deletingId === vehicle.id}
                          className="px-3 py-2 rounded-md bg-red-50 border border-red-100 text-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Add New Vehicle Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: filteredVehicles.length * 0.05 + 0.2 }}
            >
              <Link href="/client/vehicles/new">
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 transition-all duration-300 p-6 flex items-center justify-center gap-3 group cursor-pointer shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-blue-600 border border-slate-200 flex items-center justify-center transition-colors">
                    <Plus className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {t('vehicles.addVehicle')}
                    </p>
                    <p className="text-xs font-semibold text-slate-400">{t('vehicles.expandGarage')}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors ml-auto" />
                </div>
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ClientPageWrapper>
  );
}
