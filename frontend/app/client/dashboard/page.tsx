'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ClientPageWrapper,
  ClientCard,
  ClientCardHeader,
  ClientCardContent,
  ClientLoadingState,
  ClientStatCard,
  ClientEmptyState,
} from '@/components/client';
import { getVehiclesByUser } from '@/lib/api/vehicles';
import { getMyAppointments } from '@/lib/api/appointments';
import { fetchClientComplaints } from '@/lib/api/clientDashboard';
import { Vehicle } from '@/types/vehicle';
import { Appointment } from '@/types/appointment';
import {
  Plus,
  Car,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function ClientDashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'CLIENT')) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !token || user.role !== 'CLIENT') return;
      
      try {
        setLoading(true);
        const [vehiclesData, appointmentsData, complaintsData] = await Promise.all([
          getVehiclesByUser(user.id, token),
          getMyAppointments(token),
          fetchClientComplaints(token),
        ]);
        
        setVehicles(vehiclesData);
        setAppointments(appointmentsData);
        setComplaintsCount(complaintsData.length);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, token]);

  if (authLoading || !user || !token) {
    return <ClientLoadingState />;
  }

  if (loading) {
    return <ClientLoadingState message={t('common.loading')} />;
  }

  const upcomingAppointments = appointments.filter(
    (apt) => !['TERMINE', 'ANNULE'].includes(apt.statut)
  );
  const completedAppointments = appointments.filter((apt) => apt.statut === 'TERMINE').length;

  const recentAppointments = upcomingAppointments
    .sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime())
    .slice(0, 2);

  return (
    <ClientPageWrapper className="space-y-6 pb-12">
      {/* ─── Facebook-Style Welcome Banner ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#1877F2] to-[#0C63D4] p-8 shadow-sm"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
            className="h-full w-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mb-3"
            >
              <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                <span>{t('dashboard.hello')}, {user.prenom}</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight"
            >
              {t('dashboard.welcomeMessage')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-white/80 text-base mb-6 max-w-2xl"
            >
              {t('dashboard.manageAppointments')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/client/rendez-vous">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-white text-[#1877F2] px-5 py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  <Plus className="h-4 w-4" />
                  {t('dashboard.takeAppointment')}
                </motion.button>
              </Link>
              <Link href="/client/vehicles">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-md font-semibold text-sm border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Car className="h-4 w-4" />
                  {t('dashboard.myVehicles')}
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Stats Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
            className="relative"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              {/* Animated Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-white/20 border-t-white/40"
              />
              
              {/* Inner Circle */}
              <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                    {vehicles.length}
                  </div>
                  <div className="text-xs font-medium text-white/70 uppercase tracking-wide">
                    {t('dashboard.vehicles')}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Statistics Grid with Animations ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <ClientStatCard
            label={t('dashboard.upcomingAppointments')}
            value={upcomingAppointments.length}
            icon={Calendar}
            iconColor="text-[#1877F2]"
            subtitle={t('dashboard.pending')}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <ClientStatCard
            label={t('dashboard.myVehicles')}
            value={vehicles.length}
            icon={Car}
            iconColor="text-[#42B72A]"
            subtitle={t('dashboard.validated')}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <ClientStatCard
            label={t('dashboard.complaints')}
            value={complaintsCount}
            icon={MessageSquare}
            iconColor="text-[#F7B928]"
            subtitle={t('dashboard.pending')}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <ClientStatCard
            label={t('dashboard.completedAppointments')}
            value={completedAppointments}
            icon={CheckCircle2}
            iconColor="text-[#42B72A]"
            subtitle={t('common.total')}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── My Appointments Section ─── */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <ClientCard>
            <ClientCardHeader
              title={t('dashboard.myAppointments')}
              subtitle={t('appointments.manageAppointments')}
              action={
                <Link href="/client/rendez-vous">
                  <motion.button
                    whileHover={{ x: 3 }}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#1877F2] hover:underline"
                  >
                    {t('dashboard.viewAll')}
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              }
            />
            <ClientCardContent>
              {recentAppointments.length === 0 ? (
                <ClientEmptyState
                  icon={Calendar}
                  title={t('dashboard.noUpcomingAppointments')}
                  description={t('appointments.noSlotsAvailable')}
                  actionLabel={t('dashboard.takeAppointment')}
                  onAction={() => router.push('/client/rendez-vous')}
                />
              ) : (
                <div className="grid gap-3">
                  {recentAppointments.map((appointment, idx) => {
                    const date = new Date(appointment.date_heure);
                    const dayNumber = date.getDate();
                    const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short' });
                    const timeLabel = date.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + (idx * 0.1), duration: 0.3 }}
                        whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        className="group flex items-center gap-4 rounded-lg border border-[#E4E6EB] bg-[#F0F2F5] p-4 transition-all cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center rounded-lg bg-white shadow-sm border border-[#E4E6EB] px-4 py-3 min-w-[70px]">
                          <span className="text-2xl font-bold text-[#050505] leading-none">
                            {String(dayNumber).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-semibold uppercase text-[#1877F2] tracking-wide mt-1">{monthLabel}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#050505] text-base truncate mb-1">
                            {appointment.interventions?.[0]
                              ? `${appointment.interventions[0].type_nom} + ${appointment.interventions[0].sous_type_nom}`
                              : t('dashboard.serviceAppointment')}
                          </h3>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[#65676B]">
                            <span className="inline-flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {appointment.immatriculation || t('dashboard.vehicle')}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {appointment.agence_nom || t('dashboard.agency')}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeLabel}
                            </span>
                          </div>
                        </div>

                        <motion.div
                          whileHover={{ x: 3 }}
                          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E6EB] text-[#65676B] group-hover:bg-[#1877F2] group-hover:text-white transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ClientCardContent>
          </ClientCard>
        </motion.div>

        {/* ─── Quick Actions & Stats Sidebar ─── */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <ClientCard>
            <ClientCardHeader title={t('dashboard.quickActions')} />
            <ClientCardContent>
              <div className="grid gap-3">
                <Link href="/client/rendez-vous" className="group">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between rounded-lg bg-[#1877F2] p-4 text-white shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t('dashboard.takeAppointment')}</p>
                        <p className="text-xs text-white/70">{t('dashboard.bookAppointment')}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                  </motion.div>
                </Link>

                <Link href="/client/complaints" className="group">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between rounded-lg bg-[#E4E6EB] p-4 text-[#050505] shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                        <MessageSquare className="h-5 w-5 text-[#65676B]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t('dashboard.submitComplaint')}</p>
                        <p className="text-xs text-[#65676B]">{t('dashboard.reportProblem')}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#65676B] group-hover:text-[#050505] transition-colors" />
                  </motion.div>
                </Link>
              </div>
            </ClientCardContent>
          </ClientCard>
          
          {/* My Vehicles List */}
          <ClientCard>
            <ClientCardHeader 
              title={t('dashboard.myVehicles')} 
              action={
                <Link href="/client/vehicles" className="text-xs font-semibold text-[#1877F2] hover:underline">
                  {t('dashboard.viewAll')}
                </Link>
              }
            />
            <ClientCardContent>
              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-[#E4E6EB] flex items-center justify-center mx-auto mb-3">
                    <Car className="h-8 w-8 text-[#65676B]" />
                  </div>
                  <p className="text-sm font-semibold text-[#050505] mb-1">{t('dashboard.noVehicles')}</p>
                  <p className="text-xs text-[#65676B] mb-4">{t('dashboard.addVehicle')}</p>
                  <Link href="/client/vehicles/new">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-md text-sm font-semibold"
                    >
                      <Plus className="h-4 w-4" />
                      {t('dashboard.addVehicle')}
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {vehicles.slice(0, 4).map((vehicle, idx) => {
                    const isValidated = vehicle.statut_validation === 'VALIDE';
                    const isPending = vehicle.statut_validation === 'EN_ATTENTE';
                    
                    return (
                      <Link key={vehicle.id} href={`/client/vehicles/${vehicle.id}/history`}>
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + (idx * 0.1), duration: 0.3 }}
                          whileHover={{ backgroundColor: '#F0F2F5' }}
                          className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer group"
                        >
                          <div className="relative">
                            <div className="h-12 w-12 rounded-lg bg-[#E4E6EB] flex items-center justify-center shrink-0 group-hover:bg-[#D8DADF] transition-colors">
                              <Car className="h-6 w-6 text-[#65676B]" />
                            </div>
                            {/* Status Badge */}
                            {isValidated && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#42B72A] border-2 border-white flex items-center justify-center">
                                <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                            {isPending && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#F7B928] border-2 border-white flex items-center justify-center">
                                <Clock className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                              {vehicle.marque_nom} {vehicle.modele_nom}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-[#65676B] font-medium">{vehicle.immatriculation}</p>
                              {isValidated && (
                                <span className="text-[10px] font-semibold text-[#42B72A]">• {t('dashboard.validated')}</span>
                              )}
                              {isPending && (
                                <span className="text-[10px] font-semibold text-[#F7B928]">• {t('dashboard.pending')}</span>
                              )}
                            </div>
                          </div>

                          <motion.div
                            whileHover={{ x: 3 }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="h-5 w-5 text-[#65676B]" />
                          </motion.div>
                        </motion.div>
                      </Link>
                    );
                  })}
                  
                  {/* Add Vehicle Button */}
                  {vehicles.length < 10 && (
                    <Link href="/client/vehicles/new">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + (vehicles.length * 0.1) }}
                        whileHover={{ backgroundColor: '#F0F2F5' }}
                        className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer group mt-2"
                      >
                        <div className="h-12 w-12 rounded-lg bg-[#E4E6EB] flex items-center justify-center shrink-0 group-hover:bg-[#1877F2] transition-colors">
                          <Plus className="h-6 w-6 text-[#65676B] group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#65676B] group-hover:text-[#1877F2] transition-colors">
                            {t('dashboard.addVehicle')}
                          </p>
                          <p className="text-xs text-[#8A8D91]">{t('dashboard.addVehicle')}</p>
                        </div>
                      </motion.div>
                    </Link>
                  )}
                </div>
              )}
            </ClientCardContent>
          </ClientCard>
        </motion.div>
      </div>
    </ClientPageWrapper>
  );
}
