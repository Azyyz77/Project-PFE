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
  Sparkles,
  ShieldCheck,
  Zap,
  ChevronRight,
  Settings,
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
      toast.error(t('common.error'), { description: error.message || t('vehicles.deleteError') });
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

  if (isLoading) return <ClientLoadingState message="Recherche de votre garage personnel..." />;

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
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              Garage Personnel
            </div>
            <h1 className="mb-4 text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Vos <span className="text-red-500">Véhicules</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
              Gérez votre parc automobile, suivez la validation de vos véhicules et accédez rapidement aux services d'entretien STA Chery.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link href="/client/vehicles/new">
                <ClientButton variant="primary" size="large" icon={Plus}>
                  {t('vehicles.addVehicle')}
                </ClientButton>
              </Link>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input 
                  type="text"
                  placeholder="Rechercher par immatriculation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium focus:ring-4 focus:ring-red-500/20 focus:bg-white/10 focus:border-red-500/50 outline-none transition-all w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Stats Summary In Header */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total</p>
              <p className="text-3xl font-black text-white">{stats.total}</p>
            </div>
            <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Validés</p>
              <p className="text-3xl font-black text-white">{stats.validated}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Vehicles Grid ─── */}
      <AnimatePresence mode="popLayout">
        {filteredVehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ClientEmptyState
              icon={Car}
              title={searchQuery ? "Aucun véhicule trouvé" : t('vehicles.noVehicles')}
              description={searchQuery ? "Essayez une autre recherche." : "Vous n'avez pas encore enregistré de véhicule dans votre garage."}
              {...(!searchQuery ? {
                actionLabel: t('vehicles.addVehicle'),
                onAction: () => router.push('/client/vehicles/new')
              } : {})}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  layout
                >
                  <ClientCard className="h-full flex flex-col p-0 overflow-hidden border-none shadow-xl shadow-slate-200/40 group">
                    {/* Top Decorative Area */}
                    <div className={`h-24 w-full relative overflow-hidden ${
                      isValide ? 'bg-emerald-600' : isRefuse ? 'bg-red-600' : 'bg-[#0b1221]'
                    }`}>
                      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                      <div className="absolute top-4 right-6 flex gap-2">
                        <Link href={`/client/vehicles/${vehicle.id}/edit`}>
                          <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10">
                            <Settings className="h-4 w-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={deletingId === vehicle.id}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-white backdrop-blur-md transition-colors border border-white/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                      <div className="absolute top-6 left-8">
                         <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <Car className="h-6 w-6 text-white" />
                         </div>
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="p-8 flex flex-col flex-1">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`h-2 w-2 rounded-full ${isValide ? 'bg-emerald-500' : isRefuse ? 'bg-red-500' : 'bg-amber-500'}`} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {isValide ? 'Véhicule Validé' : isRefuse ? 'Validation Refusée' : 'Validation en attente'}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2 group-hover:text-red-600 transition-colors">
                          {vehicleName || t('vehicles.vehicle')}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{vehicle.immatriculation}</p>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                              <Zap className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kilométrage</p>
                              <p className="text-sm font-black text-slate-700">
                                {mileage ? `${Number(mileage).toLocaleString('fr-FR')} km` : '—'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                              <Shield className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motorisation</p>
                              <p className="text-sm font-black text-slate-700">{vehicle.motorisation || '—'}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-4">
                        <Link href={`/client/vehicles/${vehicle.id}/history`} className="w-full">
                          <ClientButton variant="outline" fullWidth size="small">
                            Historique
                          </ClientButton>
                        </Link>
                        <Link href="/client/rendez-vous" className="w-full">
                          <ClientButton variant={isValide ? "primary" : "secondary"} fullWidth size="small" disabled={!isValide}>
                            Réserver
                          </ClientButton>
                        </Link>
                      </div>
                    </div>
                  </ClientCard>
                </motion.div>
              );
            })}
            
            {/* Add New Vehicle Card Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: filteredVehicles.length * 0.1 }}
            >
              <Link href="/client/vehicles/new" className="h-full block">
                <div className="h-full min-h-[400px] rounded-[2.5rem] border-4 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center gap-6 group hover:border-red-500/30 hover:bg-red-50/20 transition-all duration-500">
                  <div className="h-20 w-20 rounded-[2rem] bg-white border-2 border-slate-100 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <Plus className="h-10 w-10 text-slate-300 group-hover:text-red-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-400 group-hover:text-red-600 transition-colors">{t('vehicles.addVehicle')}</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Agrandissez votre garage</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ClientPageWrapper>
  );
}
