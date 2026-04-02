'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getVehiclesByUser } from '@/lib/api/vehicles';
import {
  createAppointment,
  getAgencies,
  getAvailableSlots,
  getInterventionCatalog,
  getMyAppointments,
  cancelAppointment,
  getAppointmentDetails,
} from '@/lib/api/appointments';
import { Vehicle } from '@/types/vehicle';
import { Agency, Appointment, AppointmentIntervention, InterventionType, Slot } from '@/types/appointment';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Car,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Trash2,
  X,
} from 'lucide-react';

type AppointmentFilter = 'all' | 'scheduled' | 'in_progress' | 'completed';
type BookingStep = 1 | 2 | 3;

type ServiceOption = {
  id: number;
  label: string;
  typeName: string;
  subTypeName: string;
};

const WEEK_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const toLocalISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isDateValid = (dateString: string): boolean => {
  const date = new Date(`${dateString}T12:00:00`);
  return !isNaN(date.getTime());
};

const isDateInPast = (dateString: string): boolean => {
  const date = new Date(`${dateString}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export default function RendezVousPage() {
  return (
    <ProtectedRoute>
      <RendezVousContent />
    </ProtectedRoute>
  );
}


function RendezVousContent() {
  const { user, token } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [interventions, setInterventions] = useState<InterventionType[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [globalError, setGlobalError] = useState('');

  const [activeFilter, setActiveFilter] = useState<AppointmentFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState<Appointment | null>(null);
  const [appointmentInterventions, setAppointmentInterventions] = useState<AppointmentIntervention[]>([]);
  const [cancelReason, setCancelReason] = useState('');
  const [step, setStep] = useState<BookingStep>(1);

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [selectedServiceSubtypeId, setSelectedServiceSubtypeId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [notes, setNotes] = useState('');

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const todayISO = useMemo(() => toLocalISODate(new Date()), []);
  const minDateISO = todayISO;

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value instanceof Error && value.message) {
      return value.message;
    }
    return fallback;
  };

  const appointmentDateSet = useMemo(() => {
    const dateSet = new Set<string>();
    for (const item of appointments) {
      const iso = toLocalISODate(new Date(item.date_heure));
      dateSet.add(iso);
    }
    return dateSet;
  }, [appointments]);

  const serviceOptions = useMemo<ServiceOption[]>(() => {
    const options: ServiceOption[] = [];
    interventions.forEach((type) => {
      type.sous_types.forEach((subType) => {
        options.push({
          id: subType.id,
          label: `${type.nom} - ${subType.nom}`,
          typeName: type.nom,
          subTypeName: subType.nom,
        });
      });
    });
    return options;
  }, [interventions]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => String(vehicle.id) === selectedVehicleId),
    [vehicles, selectedVehicleId]
  );

  const validatedVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.statut_validation === 'VALIDE'),
    [vehicles]
  );

  const selectedService = useMemo(
    () => serviceOptions.find((service) => String(service.id) === selectedServiceSubtypeId),
    [serviceOptions, selectedServiceSubtypeId]
  );

  const selectedAgency = useMemo(
    () => agencies.find((agency) => String(agency.id) === selectedAgencyId),
    [agencies, selectedAgencyId]
  );

  const filteredAppointments = useMemo(() => {
    if (activeFilter === 'all') return appointments;

    const statusMap: Record<Exclude<AppointmentFilter, 'all'>, string[]> = {
      scheduled: ['PLANIFIE', 'CONFIRME'],
      in_progress: ['EN_COURS'],
      completed: ['TERMINE'],
    };

    return appointments.filter((appointment) => statusMap[activeFilter].includes(appointment.statut));
  }, [appointments, activeFilter]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!user || !token) return;

      setIsBootLoading(true);
      setGlobalError('');

      try {
        const [myVehicles, allAgencies, catalog] = await Promise.all([
          getVehiclesByUser(user.id, token),
          getAgencies(token),
          getInterventionCatalog(token),
        ]);

        setVehicles(myVehicles);
        setAgencies(allAgencies);
        setInterventions(catalog);

        // Load appointments
        const list = await getMyAppointments(token);
        setAppointments(list);

        if (allAgencies.length > 0) {
          setSelectedAgencyId(String(allAgencies[0].id));
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Impossible de charger les données de rendez-vous.');
        setGlobalError(msg);
        toast.error('Erreur', { description: msg });
      } finally {
        setIsBootLoading(false);
      }
    };

    bootstrap();
  }, [token, user]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!token || !selectedAgencyId || !selectedDate) {
        setSlots([]);
        setSelectedHour('');
        return;
      }

      if (!isDateValid(selectedDate)) {
        setGlobalError('Date invalide sélectionnée.');
        setSlots([]);
        return;
      }

      if (isDateInPast(selectedDate)) {
        setGlobalError('Impossible de réserver pour des dates passées.');
        setSlots([]);
        return;
      }

      setIsSlotsLoading(true);
      setGlobalError('');

      try {
        const result = await getAvailableSlots(Number(selectedAgencyId), selectedDate, token);
        setSlots(result);

        const currentlySelectedStillAvailable = result.some(
          (slot) => slot.label === selectedHour && !slot.is_full
        );
        if (!currentlySelectedStillAvailable) {
          setSelectedHour('');
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Impossible de charger les créneaux disponibles.');
        setGlobalError(msg);
      } finally {
        setIsSlotsLoading(false);
      }
    };

    loadSlots();
  }, [selectedAgencyId, selectedDate, selectedHour, token]);

  const monthMeta = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ dateISO: string | null; day: number | null }> = [];

    for (let i = 0; i < firstDayIndex; i += 1) {
      cells.push({ dateISO: null, day: null });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const iso = toLocalISODate(date);
      cells.push({ dateISO: iso, day });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ dateISO: null, day: null });
    }

    return {
      title: monthCursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      cells,
    };
  }, [monthCursor]);

  const goNextStep = () => {
    if (step === 1) {
      if (!selectedVehicleId || !selectedServiceSubtypeId || !selectedAgencyId) {
        setGlobalError('Veuillez sélectionner un véhicule, une agence et un type de service.');
        return;
      }
      setGlobalError('');
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedDate || !selectedHour) {
        setGlobalError('Veuillez choisir une date et un créneau horaire.');
        return;
      }
      if (isDateInPast(selectedDate)) {
        setGlobalError('Impossible de réserver pour des dates passées.');
        return;
      }
      setGlobalError('');
      setStep(3);
    }
  };

  const goBackStep = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const resetModal = () => {
    setStep(1);
    setSelectedVehicleId('');
    setSelectedServiceSubtypeId('');
    setSelectedDate('');
    setSelectedHour('');
    setNotes('');
    setSlots([]);
    setGlobalError('');
  };

  const openModal = (presetDate?: string) => {
    if (validatedVehicles.length === 0) {
      const msg = 'Vous devez attendre la validation de votre véhicule par un agent SAV avant de réserver un rendez-vous.';
      setGlobalError(msg);
      toast.warning('Attention', { description: msg });
      return;
    }

    setGlobalError('');
    setIsModalOpen(true);
    resetModal();
    if (presetDate && !isDateInPast(presetDate)) {
      setSelectedDate(presetDate);
      setStep(2);
    }
    if (agencies.length > 0) {
      setSelectedAgencyId(String(agencies[0].id));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetModal();
  };

  const openDetailModal = async (appointmentId: number) => {
    if (!token) return;
    try {
      setGlobalError('');
      const result = await getAppointmentDetails(appointmentId, token);
      setSelectedAppointmentId(appointmentId);
      setSelectedAppointmentDetail(result.appointment);
      setAppointmentInterventions(result.interventions);
      setIsDetailModalOpen(true);
      setCancelReason('');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Impossible de charger les détails du rendez-vous.');
      setGlobalError(msg);
      toast.error('Erreur', { description: msg });
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAppointmentId(null);
    setSelectedAppointmentDetail(null);
    setAppointmentInterventions([]);
    setCancelReason('');
  };

  const submitAppointment = async () => {
    if (!token || !selectedVehicleId || !selectedAgencyId || !selectedDate || !selectedHour || !selectedServiceSubtypeId) {
      setGlobalError('Champs obligatoires manquants pour la réservation.');
      return;
    }

    if (isDateInPast(selectedDate)) {
      setGlobalError('Impossible de réserver pour des dates passées.');
      return;
    }

    try {
      setIsSubmitting(true);
      setGlobalError('');

      const dateTime = `${selectedDate}T${selectedHour}:00`;

      await createAppointment(
        {
          vehicule_id: Number(selectedVehicleId),
          agence_id: Number(selectedAgencyId),
          date_heure: dateTime,
          description: notes || undefined,
          sous_type_ids: [Number(selectedServiceSubtypeId)],
        },
        token
      );

      toast.success('Rendez-vous réservé avec succès.');
      const list = await getMyAppointments(token);
      setAppointments(list);
      closeModal();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Ce créneau n\'est pas disponible. Veuillez choisir une autre heure.');
      setGlobalError(msg);
      toast.error('Erreur', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCancelAppointment = async () => {
    if (!token || !selectedAppointmentId) return;

    try {
      setIsCancelling(true);
      setGlobalError('');

      await cancelAppointment(selectedAppointmentId, { raison: cancelReason || undefined }, token);

      toast.success('Rendez-vous annulé avec succès.');
      const list = await getMyAppointments(token);
      setAppointments(list);
      closeDetailModal();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Impossible d\'annuler le rendez-vous.');
      setGlobalError(msg);
      toast.error('Erreur', { description: msg });
    } finally {
      setIsCancelling(false);
    }
  };

  const statusInfo = (status: string) => {
    if (status === 'EN_COURS') return { label: 'En cours', badge: 'bg-amber-100 text-amber-700' };
    if (status === 'TERMINE') return { label: 'Terminé', badge: 'bg-emerald-100 text-emerald-700' };
    if (status === 'ANNULE') return { label: 'Annulé', badge: 'bg-red-100 text-red-700' };
    if (status === 'CONFIRME' || status === 'PLANIFIE') {
      return { label: 'Planifié', badge: 'bg-blue-100 text-blue-700' };
    }
    return { label: status, badge: 'bg-slate-100 text-slate-700' };
  };

  const canCancelAppointment = (appointment: Appointment): boolean => {
    if (['TERMINE', 'ANNULE', 'NO_SHOW'].includes(appointment.statut)) {
      return false;
    }
    const appointmentDate = new Date(appointment.date_heure);
    return appointmentDate > new Date();
  };

  const isBookingWith24h = useMemo(() => {
    if (!selectedDate || !selectedHour) return false;
    const bookingTime = new Date(`${selectedDate}T${selectedHour}:00`);
    const now = new Date();
    const hoursUntilBooking = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilBooking < 24 && hoursUntilBooking > 0;
  }, [selectedDate, selectedHour]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header with Gradient Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-950 p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute -right-20 -top-20 size-40 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold">Rendez-vous</h1>
                <Badge variant="secondary" className="text-sm">
                  {appointments.length} total
                </Badge>
              </div>
              <p className="text-sm text-blue-100">Gérez et réservez vos rendez-vous de service.</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => openModal()}
                disabled={validatedVehicles.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                + Réserver un rendez-vous
              </Button>
              <Calendar className="size-8 text-blue-200 hidden sm:block" />
            </div>
          </div>
        </div>

        {validatedVehicles.length === 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Votre véhicule est en attente de validation SAV. Vous pourrez réserver un rendez-vous dès qu'un agent valide votre véhicule.
            </AlertDescription>
          </Alert>
        )}

        {globalError && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {isBootLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-3">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Calendar Card */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <CardTitle className="text-base capitalize text-center flex-1">
                    {monthMeta.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                    }
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center">
                  {WEEK_DAYS.map((day) => (
                    <span key={day} className="text-xs font-semibold text-slate-500 py-2">
                      {day}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {monthMeta.cells.map((cell, index) => {
                    if (!cell.dateISO || !cell.day) {
                      return <div key={`empty-${index}`} className="h-9" />;
                    }

                    const isToday = cell.dateISO === todayISO;
                    const isSelected = cell.dateISO === selectedDate;
                    const hasAppointment = appointmentDateSet.has(cell.dateISO);
                    const isDisabled = isDateInPast(cell.dateISO);

                    return (
                      <button
                        key={cell.dateISO}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedDate(cell.dateISO as string);
                            if (!isModalOpen) {
                              openModal(cell.dateISO as string);
                            }
                          }
                        }}
                        className={`relative h-9 rounded-lg text-xs font-semibold transition-all ${
                          isDisabled
                            ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                            : isSelected
                            ? 'bg-orange-500 text-white'
                            : isToday
                            ? 'ring-2 ring-blue-700 dark:ring-blue-400 font-bold text-blue-700 dark:text-blue-400'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cell.day}
                        {hasAppointment && !isDisabled && (
                          <span
                            className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                              isSelected || isToday ? 'bg-white' : 'bg-red-500'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-red-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Jour avec rendez-vous</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full ring-2 ring-blue-700 dark:ring-blue-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Aujourd'hui</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointments List Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tous les rendez-vous</CardTitle>
              </CardHeader>

              <CardContent>
                <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as AppointmentFilter)}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="scheduled">Planifié</TabsTrigger>
                    <TabsTrigger value="in_progress">En cours</TabsTrigger>
                    <TabsTrigger value="completed">Terminé</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeFilter} className="space-y-3">
                    {filteredAppointments.length === 0 ? (
                      <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center">
                        <Calendar className="size-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Aucun rendez-vous trouvé pour ce filtre.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => openModal()}
                          disabled={validatedVehicles.length === 0}
                        >
                          Réserver maintenant
                        </Button>
                      </div>
                    ) : (
                      filteredAppointments.map((appointment) => {
                        const when = new Date(appointment.date_heure);
                        const dayNumber = when.getDate();
                        const monthLabel = when.toLocaleDateString('fr-FR', { month: 'short' });
                        const timeLabel = when.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const status = statusInfo(appointment.statut);

                        return (
                          <Card
                            key={appointment.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => openDetailModal(appointment.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                                <div className="flex gap-4">
                                  <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-3 min-w-max">
                                    <span className="text-lg font-bold">{dayNumber}</span>
                                    <span className="text-xs uppercase text-slate-600 dark:text-slate-400">
                                      {monthLabel}
                                    </span>
                                  </div>

                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                      {appointment.interventions?.[0]
                                        ? `${appointment.interventions[0].type_nom} - ${appointment.interventions[0].sous_type_nom}`
                                        : 'Rendez-vous de service'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <Car className="size-3" />
                                        {appointment.immatriculation || 'Véhicule'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="size-3" />
                                        {appointment.agence_nom || 'Agence'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="size-3" />
                                        {timeLabel}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <Badge className={status.badge}>{status.label}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Réserver un rendez-vous</DialogTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Étape {step} sur 3</p>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex gap-4 my-6">
            {[1, 2, 3].map((item) => {
              const state = item < step ? 'done' : item === step ? 'active' : 'idle';
              return (
                <div key={item} className="flex flex-1 items-center gap-3">
                  <div
                    className={`flex items-center justify-center size-8 rounded-full font-bold text-sm transition-all ${
                      state === 'done'
                        ? 'bg-green-600 text-white'
                        : state === 'active'
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {state === 'done' ? '✓' : item}
                  </div>
                  {item !== 3 && (
                    <div className={`h-0.5 flex-1 ${state !== 'idle' ? 'bg-slate-300 dark:bg-slate-600' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          {globalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="size-4" />
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Vehicle & Service */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sélectionnez un véhicule et un service</h3>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Agence *</label>
                <select
                  value={selectedAgencyId}
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 px-4 py-2 text-sm"
                >
                  <option value="">Sélectionner une agence</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.nom} - {agency.ville}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Véhicule *</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 px-4 py-2 text-sm"
                >
                  <option value="">Sélectionnez votre véhicule</option>
                  {validatedVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.immatriculation} - {vehicle.marque_nom || ''} {vehicle.modele_nom || ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVehicle && (
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                  <CardContent className="p-4 pt-4">
                    <div className="flex items-center gap-3">
                      <Car className="size-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-semibold text-sm">
                          {selectedVehicle.marque_nom} {selectedVehicle.modele_nom}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {selectedVehicle.immatriculation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold">Type de service *</label>
                <select
                  value={selectedServiceSubtypeId}
                  onChange={(e) => setSelectedServiceSubtypeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 px-4 py-2 text-sm"
                >
                  <option value="">Sélectionner un type de service</option>
                  {serviceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sélectionnez une date et une heure</h3>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Date *</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={minDateISO}
                  className="rounded-lg"
                />
              </div>

              {isSlotsLoading ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Créneau horaire *</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-9 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : slots.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Créneau horaire *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <Button
                        key={slot.hour}
                        variant={selectedHour === slot.label ? 'default' : 'outline'}
                        disabled={slot.is_full}
                        onClick={() => setSelectedHour(slot.label)}
                        className={
                          selectedHour === slot.label
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : slot.is_full
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-orange-50 dark:hover:bg-orange-950/20'
                        }
                        size="sm"
                      >
                        <span className="text-xs">{slot.label}</span>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    {slots.some((s) => !s.is_full) ? 'Sélectionnez une heure disponible' : 'Aucun créneau disponible'}
                  </p>
                </div>
              ) : (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    Aucun créneau disponible pour cette date et agence.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold">Notes supplémentaires (Optionnel)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Toute demande spéciale ou commentaire..."
                  className="min-h-24"
                  maxLength={500}
                />
                <p className="text-xs text-slate-500">
                  {notes.length}/500 caractères
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vérifier et confirmer</h3>

              {isBookingWith24h && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    Attention: Ce rendez-vous est prévu dans moins de 24h.
                  </AlertDescription>
                </Alert>
              )}

              <Card className="bg-slate-50 dark:bg-slate-900/30">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Véhicule</p>
                      <p className="font-semibold text-sm">
                        {selectedVehicle?.marque_nom} {selectedVehicle?.modele_nom}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedVehicle?.immatriculation}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Agence</p>
                      <p className="font-semibold text-sm">{selectedAgency?.nom}</p>
                      <p className="text-xs text-slate-500">{selectedAgency?.ville}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Service</p>
                    <p className="font-semibold text-sm">{selectedService?.label}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Date</p>
                      <p className="font-semibold text-sm">{selectedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Heure</p>
                      <p className="font-semibold text-sm">{selectedHour}</p>
                    </div>
                  </div>
                  {notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Remarques</p>
                        <p className="text-sm mt-1">{notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={goBackStep}
                disabled={isSubmitting}
              >
                Retour
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={goNextStep}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Suivant
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={submitAppointment}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? 'Traitement en cours...' : 'Confirmer le rendez-vous'}
                {!isSubmitting && <CheckCircle className="size-4 ml-2" />}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>

          {globalError && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}

          {selectedAppointmentDetail && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="text-center">
                <Badge className={`${statusInfo(selectedAppointmentDetail.statut).badge} text-base`}>
                  {statusInfo(selectedAppointmentDetail.statut).label}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50 dark:bg-slate-900/30">
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Véhicule</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Car className="size-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-semibold text-sm">
                          {selectedAppointmentDetail.marque_nom} {selectedAppointmentDetail.modele_nom}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedAppointmentDetail.immatriculation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 dark:bg-slate-900/30">
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Agence</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="size-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-semibold text-sm">
                          {selectedAppointmentDetail.agence_nom}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedAppointmentDetail.agence_ville}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50 dark:bg-slate-900/30">
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Date et Heure</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="size-4 text-slate-600 dark:text-slate-400" />
                      <p className="font-semibold text-sm">
                        {new Date(selectedAppointmentDetail.date_heure).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 dark:bg-slate-900/30">
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Services</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Wrench className="size-4 text-slate-600 dark:text-slate-400" />
                      <p className="font-semibold text-sm">
                        {appointmentInterventions.length} service(s)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Services List */}
              <div>
                <p className="text-sm font-semibold mb-2">Détails des services</p>
                <div className="space-y-2">
                  {appointmentInterventions.length > 0 ? (
                    appointmentInterventions.map((intervention) => (
                      <Card key={intervention.id}>
                        <CardContent className="p-3">
                          <p className="font-semibold text-sm">{intervention.type_nom}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {intervention.sous_type_nom}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Aucun service spécifié</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedAppointmentDetail.description && (
                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Remarques</p>
                  <p className="text-sm">{selectedAppointmentDetail.description}</p>
                </div>
              )}

              {/* Cancel Section */}
              {canCancelAppointment(selectedAppointmentDetail) && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="font-semibold">Annuler ce rendez-vous ?</p>
                      <Textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Pourquoi annulez-vous ce rendez-vous ? (optionnel)"
                        className="min-h-20 dark:bg-slate-900 dark:border-slate-700"
                        maxLength={300}
                      />
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={closeDetailModal}
              disabled={isCancelling}
            >
              Fermer
            </Button>
            {selectedAppointmentDetail && canCancelAppointment(selectedAppointmentDetail) && (
              <Button
                variant="destructive"
                onClick={submitCancelAppointment}
                disabled={isCancelling}
              >
                {isCancelling ? 'Annulation en cours...' : 'Annuler le rendez-vous'}
                {!isCancelling && <Trash2 className="size-4 ml-2" />}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
