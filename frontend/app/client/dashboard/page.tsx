'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ClientPageWrapper,
  ClientButton,
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
    return <ClientLoadingState message={t('dashboard.loading') || 'Chargement du tableau de bord...'} />;
  }

  const upcomingAppointments = appointments.filter(
    (apt) => !['TERMINE', 'ANNULE'].includes(apt.statut)
  );
  const completedAppointments = appointments.filter((apt) => apt.statut === 'TERMINE').length;

  const recentAppointments = upcomingAppointments
    .sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime())
    .slice(0, 2);

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Modern Welcome Banner ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-16 text-white shadow-2xl"
      >
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-red-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md border border-white/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t('dashboard.hello')}, {user.prenom}
            </motion.div>
            <h1 className="mb-6 text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Votre <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Chery</span> mérite le meilleur service.
            </h1>
            <p className="mb-10 text-lg text-slate-400 font-medium leading-relaxed">
              {t('dashboard.welcomeMessage') || 'Bienvenue sur votre espace client. Gérez vos véhicules, vos rendez-vous et vos documents en toute simplicité.'}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link href="/client/rendez-vous">
                <ClientButton variant="primary" 
                icon={Plus} 
                size="large"
                >
                  {t('dashboard.takeAppointment')}
                </ClientButton>
              </Link>
              <Link href="/client/vehicles">
                <ClientButton 
                variant="outline" 
                icon={Car} 
                size="large" 
                className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  {t('dashboard.myVehicles')}
                </ClientButton>
              </Link>
            </div>
          </div>

          {/* Decorative Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-10 rounded-full bg-red-600/20 blur-[60px] animate-pulse" />
            <div className="h-72 w-72 rounded-[4rem] border-2 border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl flex items-center justify-center p-8 shadow-inner">
               <Car className="h-40 w-40 text-white opacity-20 absolute" />
               <div className="text-center">
                  <span className="block text-5xl font-black text-white">{vehicles.length}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('dashboard.vehicles')}</span>
               </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Statistics Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClientStatCard
          label={t('dashboard.upcomingAppointments')}
          value={upcomingAppointments.length}
          icon={Calendar}
          iconColor="text-red-600"
          subtitle="Prochainement"
        />
        <ClientStatCard
          label={t('dashboard.vehicles')}
          value={vehicles.length}
          icon={Car}
          iconColor="text-blue-600"
          subtitle="Actifs"
        />
        <ClientStatCard
          label={t('dashboard.complaints')}
          value={complaintsCount}
          icon={MessageSquare}
          iconColor="text-amber-500"
          subtitle="En attente"
        />
        <ClientStatCard
          label={t('dashboard.completedAppointments')}
          value={completedAppointments}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          subtitle="Total"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 bg-re">
        {/* ─── My Appointments Section ─── */}
        <div className="lg:col-span-2">
          <ClientCard>
            <ClientCardHeader
              title={t('dashboard.myAppointments')}
              subtitle="Consultez vos rendez-vous récents"
              action={
                <Link href="/client/rendez-vous">
                  <ClientButton variant="outline" size="small">
                    {t('dashboard.viewAll')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </ClientButton>
                </Link>
              }
            />
            <ClientCardContent>
              {recentAppointments.length === 0 ? (
                <ClientEmptyState
                  icon={Calendar}
                  title={t('dashboard.noUpcomingAppointments')}
                  description={t('dashboard.bookAppointmentDescription')}
                  actionLabel={t('dashboard.takeAppointment')}
                  onAction={() => router.push('/client/rendez-vous')}
                />
              ) : (
                <div className="grid gap-4">
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
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="group flex items-center gap-6 rounded-3xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
                      >
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 px-5 py-4 min-w-[80px]">
                          <span className="text-3xl font-black text-slate-800 tracking-tighter">
                            {String(dayNumber).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">{monthLabel}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-lg truncate">
                            {appointment.interventions?.[0]
                              ? `${appointment.interventions[0].type_nom} + ${appointment.interventions[0].sous_type_nom}`
                              : t('dashboard.serviceAppointment') || 'Rendez-vous service'}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <Car className="h-3.5 w-3.5" />
                              {appointment.immatriculation || t('dashboard.vehicle')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {appointment.agence_nom || t('dashboard.agency')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {timeLabel}
                            </span>
                          </div>
                        </div>

                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 transition-colors group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ClientCardContent>
          </ClientCard>
        </div>

        {/* ─── Quick Actions & Stats Sidebar ─── */}
        <div className="space-y-6">
          <ClientCard>
            <ClientCardHeader title={t('dashboard.quickActions')} />
            <ClientCardContent>
              <div className="grid gap-4">
                <Link href="/client/rendez-vous" className="group">
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-red-600 p-5 text-white shadow-lg shadow-red-200 transition-all hover:translate-x-1 hover:shadow-red-300">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider">Prendre RDV</p>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Réservez un créneau</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </Link>

                <Link href="/client/complaints" className="group">
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-800 p-5 text-white shadow-lg shadow-slate-200 transition-all hover:translate-x-1 hover:shadow-slate-300">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider">Réclamation</p>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Signaler un problème</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              </div>
            </ClientCardContent>
          </ClientCard>
          
          {/* My Vehicles Card */}
          <ClientCard>
            <ClientCardHeader 
              title={t('dashboard.myVehicles')} 
              action={
                <Link href="/client/vehicles" className="text-xs font-bold text-red-600 hover:underline">
                  Voir tout
                </Link>
              }
            />
            <ClientCardContent>
              {vehicles.length === 0 ? (
                <div className="text-center py-6">
                  <Car className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Aucun véhicule</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.slice(0, 3).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Car className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{vehicle.marque_nom} {vehicle.modele_nom}</p>
                        <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{vehicle.immatriculation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ClientCardContent>
          </ClientCard>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
