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
        className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-white shadow-md"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-400 backdrop-blur-md border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              Garage Personnel
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-bold tracking-tight leading-none">
              Vos <span className="text-blue-500">Véhicules</span>
            </h1>
            <p className="text-[#B0B3B8] font-medium text-lg leading-relaxed mb-8">
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
                  <Search className="h-4 w-4 text-[#8A8D91] group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text"
                  placeholder="Rechercher par immatriculation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-12 pr-6 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/20 focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Stats Summary In Header */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="p-6 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A8D91] mb-1">Total</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 mb-1">Validés</p>
              <p className="text-3xl font-bold text-white">{stats.validated}</p>
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
              title={searchQuery ? "Aucun véhicule trouvé" : t('vehicles.noVehicles')}
              description={searchQuery ? "Essayez une autre recherche." : "Vous n'avez pas encore enregistré de véhicule dans votre garage."}
              {...(!searchQuery ? {
                actionLabel: t('vehicles.addVehicle'),
                onAction: () => router.push('/client/vehicles/new')
              } : {})}
            />
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Vehicles List */}
            <div className="bg-white rounded-lg border border-[#E4E6EB] shadow-sm overflow-hidden">
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
                    <div className={`flex items-center gap-4 p-4 hover:bg-[#F0F2F5] transition-all duration-200 ${
                      idx !== filteredVehicles.length - 1 ? 'border-b border-[#E4E6EB]' : ''
                    }`}>
                      {/* Vehicle Icon with Status */}
                      <div className="relative shrink-0">
                        <div className={`h-16 w-16 rounded-lg flex items-center justify-center ${
                          isValide ? 'bg-[#E7F3FF]' : isRefuse ? 'bg-[#FFEBE9]' : 'bg-[#FFF3CD]'
                        }`}>
                          <Car className={`h-8 w-8 ${
                            isValide ? 'text-[#1877F2]' : isRefuse ? 'text-[#F02849]' : 'text-[#F7B928]'
                          }`} />
                        </div>
                        {/* Status Badge */}
                        <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center ${
                          isValide ? 'bg-[#42B72A]' : isRefuse ? 'bg-[#F02849]' : 'bg-[#F7B928]'
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
                            <h3 className="text-base font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                              {vehicleName || t('vehicles.vehicle')}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-semibold text-[#65676B]">
                                {vehicle.immatriculation}
                              </span>
                              <span className="text-xs text-[#8A8D91]">•</span>
                              <span className={`text-xs font-semibold ${
                                isValide ? 'text-[#42B72A]' : isRefuse ? 'text-[#F02849]' : 'text-[#F7B928]'
                              }`}>
                                {isValide ? 'Validé' : isRefuse ? 'Refusé' : 'En attente'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#65676B]">
                          {mileage && (
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-[#8A8D91]" />
                              <span className="font-medium">{Number(mileage).toLocaleString('fr-FR')} km</span>
                            </div>
                          )}
                          {vehicle.motorisation && (
                            <div className="flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5 text-[#8A8D91]" />
                              <span className="font-medium">{vehicle.motorisation}</span>
                            </div>
                          )}
                          {vehicle.annee && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{vehicle.annee}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <Link href={`/client/vehicles/${vehicle.id}/history`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-md bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-sm font-semibold transition-colors"
                          >
                            Historique
                          </motion.button>
                        </Link>
                        <Link href="/client/rendez-vous">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!isValide}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                              isValide
                                ? 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                                : 'bg-[#E4E6EB] text-[#8A8D91] cursor-not-allowed'
                            }`}
                          >
                            Réserver
                          </motion.button>
                        </Link>
                        <Link href={`/client/vehicles/${vehicle.id}/edit`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-md bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#65676B] transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={deletingId === vehicle.id}
                          className="p-2 rounded-md bg-[#FFEBE9] hover:bg-[#FFD6D1] text-[#F02849] transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>

                      {/* Mobile Chevron */}
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="sm:hidden text-[#65676B]"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.div>
                    </div>

                    {/* Mobile Actions (Expandable) */}
                    <div className="sm:hidden px-4 pb-4 pt-2 bg-[#F0F2F5]/50 border-b border-[#E4E6EB]">
                      <div className="flex gap-2">
                        <Link href={`/client/vehicles/${vehicle.id}/history`} className="flex-1">
                          <button className="w-full px-3 py-2 rounded-md bg-white border border-[#E4E6EB] text-[#050505] text-sm font-semibold">
                            Historique
                          </button>
                        </Link>
                        <Link href="/client/rendez-vous" className="flex-1">
                          <button
                            disabled={!isValide}
                            className={`w-full px-3 py-2 rounded-md text-sm font-semibold ${
                              isValide
                                ? 'bg-[#1877F2] text-white'
                                : 'bg-[#E4E6EB] text-[#8A8D91]'
                            }`}
                          >
                            Réserver
                          </button>
                        </Link>
                        <Link href={`/client/vehicles/${vehicle.id}/edit`}>
                          <button className="px-3 py-2 rounded-md bg-white border border-[#E4E6EB] text-[#65676B]">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={deletingId === vehicle.id}
                          className="px-3 py-2 rounded-md bg-[#FFEBE9] text-[#F02849] disabled:opacity-50"
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
                <div className="bg-white rounded-lg border-2 border-dashed border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5] transition-all duration-200 p-6 flex items-center justify-center gap-3 group cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-[#E4E6EB] group-hover:bg-[#1877F2] flex items-center justify-center transition-colors">
                    <Plus className="h-5 w-5 text-[#65676B] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#050505] group-hover:text-[#1877F2] transition-colors">
                      {t('vehicles.addVehicle')}
                    </p>
                    <p className="text-xs text-[#65676B]">Agrandissez votre garage</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#8A8D91] group-hover:text-[#1877F2] transition-colors ml-auto" />
                </div>
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ClientPageWrapper>
  );
}
