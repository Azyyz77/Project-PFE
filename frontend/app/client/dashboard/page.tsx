'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getVehiclesByUser } from '@/lib/api/vehicles';
import { getMyAppointments } from '@/lib/api/appointments';
import { fetchClientComplaints } from '@/lib/api/clientDashboard';
import { Vehicle } from '@/types/vehicle';
import { Appointment } from '@/types/appointment';
import {
  Plus,
  ChevronRight,
  Car,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}

function ClientDashboardContent() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isClient = useMemo(() => user?.role === 'CLIENT', [user]);

  useEffect(() => {
    if (user && !isClient) router.replace('/dashboard/agent');
  }, [user, isClient, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || !token || !isClient) return;
      try {
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
        setIsLoading(false);
      }
    };
    load();
  }, [user, token, isClient]);

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  // Calculate stats
  const upcomingAppointments = appointments.filter((apt) => !['TERMINE', 'ANNULE'].includes(apt.statut));

  const pendingComplaints = complaintsCount;
  const completedAppointments = appointments.filter((apt) => apt.statut === 'TERMINE').length;
  const now = new Date();
  const completedThisMonth = appointments.filter((apt) => {
    if (apt.statut !== 'TERMINE') return false;
    const aptDate = new Date(apt.date_heure);
    return aptDate.getFullYear() === now.getFullYear() && aptDate.getMonth() === now.getMonth();
  }).length;

  // Get recent appointments (last 2)
  const recentAppointments = appointments
    .filter((apt) => !['TERMINE', 'ANNULE'].includes(apt.statut))
    .sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime())
    .slice(0, 2);

  return (
    <div className="client-page-enter space-y-6 p-6">
      {/* Hero Section */}
      <div className="client-reveal relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f2f5d] via-[#173d7a] to-[#1d4f98] p-8 text-white shadow-[0_18px_40px_rgba(15,47,93,0.35)] hover:shadow-[0_25px_50px_rgba(15,47,93,0.45)] transition-shadow duration-500">
        <div className="pointer-events-none absolute -right-10 top-4 h-44 w-44 rounded-full bg-white/10 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="pointer-events-none absolute right-24 bottom-6 h-24 w-24 rounded-full bg-white/10 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 opacity-10">
          <Car className="h-40 w-40" />
        </div>

        <div className="relative z-10">
          <p className="mb-1 text-sm text-blue-200">{t('dashboard.hello')},</p>
          <h1 className="mb-2 text-3xl font-bold">
            {user?.prenom} {user?.nom}
          </h1>
          <p className="mb-6 text-sm text-blue-100">
            {t('dashboard.welcomeMessage')}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/client/rendez-vous">
              <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                {t('dashboard.takeAppointment')}
              </Button>
            </Link>

            <Link href="/client/vehicles">
              <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                <Car className="mr-2 h-4 w-4" />
                {t('dashboard.myVehicles')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="client-reveal client-reveal-delay-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-slate-200/70 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard.upcomingAppointments')}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{upcomingAppointments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/70 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard.vehicles')}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{vehicles.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <Car className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/70 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard.complaints')}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{pendingComplaints}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                <MessageSquare className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/70 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard.completedAppointments')}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{completedAppointments}</p>
                {completedThisMonth > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                    <span className="font-medium">+{completedThisMonth} {t('dashboard.thisMonth')}</span>
                  </div>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="client-reveal client-reveal-delay-2 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Mes Rendez-vous Section */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-slate-200/70 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.myAppointments')}</h2>
                <Link href="/client/rendez-vous">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    {t('dashboard.viewAll')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recentAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-10 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-slate-400" />
                    <p className="mb-4 text-sm text-slate-600">{t('dashboard.noUpcomingAppointments')}</p>
                    <Link href="/client/rendez-vous">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('dashboard.takeAppointment')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentAppointments.map((appointment, index) => {
                    const date = new Date(appointment.date_heure);
                    const dayNumber = date.getDate();
                    const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short' });
                    const timeLabel = date.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const statusColors = {
                      CONFIRME: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                      PLANIFIE: 'bg-blue-100 text-blue-700 border-blue-200',
                      EN_COURS: 'bg-amber-100 text-amber-700 border-amber-200',
                    };

                    const statusLabels = {
                      CONFIRME: t('dashboard.confirmed'),
                      PLANIFIE: t('dashboard.planned'),
                      EN_COURS: t('dashboard.inProgress'),
                    };

                    return (
                      <div
                        key={appointment.id}
                        className={`flex items-center gap-4 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                          index === recentAppointments.length - 1 ? '' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50 px-4 py-3 min-w-[70px]">
                          <span className="text-2xl font-bold text-blue-900">{String(dayNumber).padStart(2, '0')}</span>
                          <span className="text-xs uppercase text-blue-600">{monthLabel}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {appointment.interventions?.[0]
                                  ? `${appointment.interventions[0].type_nom} + ${appointment.interventions[0].sous_type_nom}`
                                  : t('dashboard.serviceAppointment')}
                              </h3>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Car className="h-3 w-3" />
                                  {appointment.immatriculation || t('dashboard.vehicle')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {appointment.agence_nom || t('dashboard.agency')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {timeLabel}
                                </span>
                              </div>
                            </div>
                            <Badge className={`${statusColors[appointment.statut as keyof typeof statusColors] || 'bg-slate-100 text-slate-700'} border`}>
                              {statusLabels[appointment.statut as keyof typeof statusLabels] || appointment.statut}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div>
          <Card className="rounded-2xl border border-slate-200/70 shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('dashboard.quickActions')}</h2>
              <div className="space-y-3">
                <Link href="/client/rendez-vous" className="block">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white p-4 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{t('dashboard.takeAppointment')}</p>
                        <p className="text-xs text-slate-500">{t('dashboard.bookAppointment')}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>

                <Link href="/client/complaints" className="block">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white p-4 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <MessageSquare className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{t('dashboard.submitComplaint')}</p>
                        <p className="text-xs text-slate-500">{t('dashboard.reportProblem')}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="client-reveal client-reveal-delay-3">
        <Card className="rounded-2xl border border-slate-200/70 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.myVehicles')}</h2>
              <Link href="/client/vehicles">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  {t('dashboard.viewAll')}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-10 text-center">
                <Car className="mb-4 h-12 w-12 text-slate-400" />
                <p className="mb-4 text-sm text-slate-600">{t('dashboard.noVehicles')}</p>
                <Link href="/client/vehicles">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('dashboard.addVehicle')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => {
                  const statusStyles: Record<string, string> = {
                    VALIDE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    EN_ATTENTE: 'bg-amber-100 text-amber-700 border-amber-200',
                    REFUSE: 'bg-rose-100 text-rose-700 border-rose-200',
                  };

                  const statusLabels: Record<string, string> = {
                    VALIDE: t('dashboard.validated'),
                    EN_ATTENTE: t('dashboard.pending'),
                    REFUSE: t('dashboard.refused'),
                  };

                  const vehicleName = [vehicle.marque_nom, vehicle.modele_nom, vehicle.version_nom]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <Car className="h-6 w-6 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {vehicleName || vehicle.immatriculation || t('dashboard.vehicle')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {vehicle.immatriculation || t('dashboard.unknownPlate')}
                            {vehicle.annee ? ` · ${vehicle.annee}` : ''}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${statusStyles[vehicle.statut_validation || ''] || 'bg-slate-100 text-slate-700 border-slate-200'} border`}>
                        {statusLabels[vehicle.statut_validation || ''] || t('dashboard.undefined')}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
