'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import WelcomeMessagesBanner from '@/components/client/WelcomeMessagesBanner';
import { getVehiclesByUser } from '@/lib/api/vehicles';
import { getMyAppointments } from '@/lib/api/appointments';
import { Vehicle } from '@/types/vehicle';
import { Appointment } from '@/types/appointment';
import {
  Plus,
  ChevronRight,
  Car,
  Calendar,
  MessageSquare,
  Wrench,
  FileText,
  AlertCircle,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}

function ClientDashboardContent() {
  const { user, token } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isClient = useMemo(() => user?.role === 'CLIENT', [user]);

  useEffect(() => {
    if (user && !isClient) router.replace('/dashboard/agent');
  }, [user, isClient, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || !token || !isClient) return;
      try {
        const [vehiclesData, appointmentsData] = await Promise.all([
          getVehiclesByUser(user.id, token),
          getMyAppointments(token),
        ]);
        setVehicles(vehiclesData);
        setAppointments(appointmentsData);
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
  const thisMonthAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date_heure);
    const now = new Date();
    return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
  });

  const pendingComplaints = 2; // TODO: Get from API
  const totalInterventions = 8; // TODO: Get from API

  // Get recent appointments (last 3)
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.date_heure).getTime() - new Date(a.date_heure).getTime())
    .slice(0, 3);

  // Check for maintenance reminders
  const needsMaintenanceVehicle = vehicles.find((v) => v.kilometrage && v.kilometrage > 30000);

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Messages Banner */}
      <WelcomeMessagesBanner afficherDashboard={true} />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f3a] via-[#0f2a4d] to-[#0b1f3a] p-8 text-white shadow-sm">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Car className="h-32 w-32" />
        </div>

        <div className="relative z-10">
          <p className="text-sm text-blue-100">Bonjour,</p>
          <h1 className="mb-2 text-2xl font-semibold md:text-3xl">
            {user?.prenom} {user?.nom} 👋
          </h1>
          <p className="mb-6 text-sm text-blue-100">
            Bienvenue sur votre espace client STA Chery Tunisia.
          </p>

          <Link href="/client/rendez-vous">
            <Button className="rounded-full bg-red-600 px-5 text-white hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Prendre un rendez-vous
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Véhicules</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{vehicles.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">RDV ce mois</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{thisMonthAppointments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Réclamations</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{pendingComplaints}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                <MessageSquare className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Interventions</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{totalInterventions}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/client/rendez-vous"
            className="flex items-center gap-3 rounded-xl bg-[#0b1f3a] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#0a1a30]"
          >
            <Calendar className="h-5 w-5" />
            Nouveau RDV
          </Link>

          <Link
            href="/client/vehicles"
            className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <Car className="h-5 w-5" />
            Mes véhicules
          </Link>

          <Link
            href="/client/rendez-vous"
            className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <FileText className="h-5 w-5" />
            Mes RDV
          </Link>

          <Link
            href="/client/complaints"
            className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <MessageSquare className="h-5 w-5" />
            Réclamation
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mes véhicules */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Mes véhicules</h2>
            <Link href="/client/vehicles" className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Voir tout
              <ChevronRight className="ml-1 inline-block h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {vehicles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Car className="mb-4 h-12 w-12 text-slate-400" />
                  <p className="mb-4 text-sm text-slate-600">Aucun véhicule enregistré</p>
                  <Link href="/client/vehicles/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un véhicule
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              vehicles.map((vehicle) => {
                const statusConfig =
                  vehicle.statut_validation === 'VALIDE'
                    ? { label: 'Validé', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' }
                    : vehicle.statut_validation === 'EN_ATTENTE'
                    ? { label: 'En attente', badge: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' }
                    : { label: vehicle.statut_validation, badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' };

                return (
                  <div key={vehicle.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <Car className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {vehicle.marque_nom} {vehicle.modele_nom}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {vehicle.immatriculation} · {vehicle.kilometrage?.toLocaleString()} km
                      </p>
                    </div>
                    <Badge className={`gap-2 rounded-full border px-3 py-1 text-xs ${statusConfig.badge}`}>
                      <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                      {statusConfig.label}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rendez-vous récents */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Rendez-vous récents</h2>
            <Link href="/client/rendez-vous" className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Voir tout
              <ChevronRight className="ml-1 inline-block h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Calendar className="mb-4 h-12 w-12 text-slate-400" />
                  <p className="mb-4 text-sm text-slate-600">Aucun rendez-vous</p>
                  <Link href="/client/rendez-vous">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Prendre un RDV
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              recentAppointments.map((appointment) => {
                const date = new Date(appointment.date_heure);
                const dateStr = date.toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                });
                const timeStr = date.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const statusConfig =
                  appointment.statut === 'CONFIRME'
                    ? { label: 'Confirmé', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' }
                    : appointment.statut === 'EN_COURS'
                    ? { label: 'En cours', badge: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' }
                    : appointment.statut === 'TERMINE'
                    ? { label: 'Terminé', badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' }
                    : { label: 'Planifié', badge: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' };

                return (
                  <div key={appointment.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {appointment.interventions?.[0]
                          ? `${appointment.interventions[0].type_nom} + ${appointment.interventions[0].sous_type_nom}`
                          : 'Rendez-vous'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {dateStr} · {timeStr} · {appointment.agence_nom || 'Agence'}
                      </p>
                    </div>
                    <Badge className={`gap-2 rounded-full border px-3 py-1 text-xs ${statusConfig.badge}`}>
                      <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                      {statusConfig.label}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Maintenance Alert */}
      {needsMaintenanceVehicle && (
        <Alert className="rounded-2xl border border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Rappel d'entretien</strong>
            <br />
            Votre {needsMaintenanceVehicle.marque_nom} {needsMaintenanceVehicle.modele_nom} approche des{' '}
            {needsMaintenanceVehicle.kilometrage?.toLocaleString()} km. Planifiez votre prochaine révision dès maintenant.
            <Link href="/client/rendez-vous" className="ml-2 font-semibold underline">
              Prendre un RDV →
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
