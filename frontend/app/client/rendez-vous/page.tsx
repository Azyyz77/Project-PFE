'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PhoneVerificationRequired } from '@/components/PhoneVerificationRequired';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getVehiclesByUser } from '@/lib/api/vehicles';
import {
  createAppointment,
  getAgencies,
  getAvailableSlots,
  getInterventionCatalog,
  getMyAppointments,
  cancelAppointment,
  getAppointmentDetails,
  getAvailablePackages,
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
import AppointmentFeedback from '@/components/client/AppointmentFeedback';
import AppointmentAttachments from '@/components/client/AppointmentAttachments';
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
  Star,
} from 'lucide-react';

type AppointmentFilter = 'all' | 'scheduled' | 'in_progress' | 'completed';
type BookingStep = 1 | 2 | 3;

type ServiceOption = {
  id: number;
  label: string;
  typeName: string;
  subTypeName: string;
};

type PackageOption = {
  id: number;
  nom: string;
  description: string;
  prix: number;
  actif: boolean;
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

const formatImmatriculation = (immat: string): string => {
  // Format: 123 تونس 4567 (3 numbers + تونس + 4 numbers)
  if (!immat) return '';
  
  // Extract all digits from the string
  const digits = immat.replace(/\D/g, '');
  
  // Check if we have at least 7 digits (3 + 4)
  if (digits.length >= 7) {
    // Take first 3 digits and last 4 digits
    const firstPart = digits.slice(0, 3);
    const lastPart = digits.slice(-4);
    return `${firstPart} تونس ${lastPart}`;
  }
  
  // If less than 7 digits, try to split what we have
  if (digits.length >= 4) {
    const splitPoint = digits.length - 4;
    const firstPart = digits.slice(0, splitPoint);
    const lastPart = digits.slice(splitPoint);
    return `${firstPart} تونس ${lastPart}`;
  }
  
  // If pattern doesn't match, return original
  return immat;
};

export default function RendezVousPage() {
  return (
    <ProtectedRoute>
      <PhoneVerificationRequired message="Vous devez vérifier votre numéro de téléphone pour pouvoir prendre des rendez-vous.">
        <RendezVousContent />
      </PhoneVerificationRequired>
    </ProtectedRoute>
  );
}


function RendezVousContent() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [interventions, setInterventions] = useState<InterventionType[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);

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
        const [myVehicles, allAgencies, catalog, availablePackages] = await Promise.all([
          getVehiclesByUser(user.id, token),
          getAgencies(token),
          getInterventionCatalog(token),
          getAvailablePackages(token),
        ]);

        setVehicles(myVehicles);
        setAgencies(allAgencies);
        setInterventions(catalog);
        setPackages(availablePackages);

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
        setGlobalError(t('appointments.errorSelectAll'));
        return;
      }
      setGlobalError('');
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedDate || !selectedHour) {
        setGlobalError(t('appointments.errorSelectDateTime'));
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
    setSelectedPackageIds([]);
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

  const refreshAppointments = async () => {
    if (!token) return;
    try {
      const list = await getMyAppointments(token);
      setAppointments(list);
    } catch (err: unknown) {
      console.error('Error refreshing appointments:', err);
    }
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

      const result = await createAppointment(
        {
          vehicule_id: Number(selectedVehicleId),
          agence_id: Number(selectedAgencyId),
          date_heure: dateTime,
          description: notes || undefined,
          sous_type_ids: [Number(selectedServiceSubtypeId)],
          package_ids: selectedPackageIds.length > 0 ? selectedPackageIds : undefined,
        },
        token
      );

      // Show success message with price if packages were selected
      if (result.prix_total && result.prix_total > 0) {
        toast.success('Rendez-vous réservé avec succès', {
          description: `Prix estimatif: ${result.prix_total.toFixed(3)} TND`
        });
      } else {
        toast.success('Rendez-vous réservé avec succès.');
      }

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
    if (status === 'EN_COURS') return { label: t('appointments.inProgress'), badge: 'bg-amber-100 text-amber-700' };
    if (status === 'TERMINE') return { label: t('appointments.completed'), badge: 'bg-emerald-100 text-emerald-700' };
    if (status === 'ANNULE') return { label: t('dashboard.refused'), badge: 'bg-red-100 text-red-700' };
    if (status === 'CONFIRME' || status === 'PLANIFIE') {
      return { label: t('appointments.planned'), badge: 'bg-blue-100 text-blue-700' };
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

  const totalPrice = useMemo(() => {
    return selectedPackageIds.reduce((sum, packageId) => {
      const pkg = packages.find(p => p.id === packageId);
      return sum + (pkg?.prix || 0);
    }, 0);
  }, [selectedPackageIds, packages]);

  const togglePackage = (packageId: number) => {
    setSelectedPackageIds(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const selectSlot = useCallback((slot: Slot) => {
    if (slot.is_full) {
      const message = `Le créneau ${slot.label} est complet (${slot.reserved}/${slot.capacity}).`;
      setGlobalError(message);
      setSelectedHour('');
      toast.warning('Créneau indisponible', { description: message });
      return;
    }

    setGlobalError('');
    setSelectedHour(slot.label);
  }, []);

  if (!user) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-10">
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {t('appointments.title')}
            </h1>
            <Badge variant="secondary" className="font-normal mt-1">
              {appointments.length} {t('appointments.total')}
            </Badge>
          </div>
          <p className="text-muted-foreground">{t('appointments.manageAppointments')}</p>
        </div>

        <Button
          onClick={() => openModal()}
          disabled={validatedVehicles.length === 0}
          size="lg"
          className="w-full md:w-auto"
        >
          + {t('appointments.bookAppointment')}
        </Button>
      </div>

      <div className="h-px w-full bg-border" />

        {validatedVehicles.length === 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {t('appointments.vehicleValidationRequired')}
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
                    <span className="text-xs text-slate-600 dark:text-slate-400">{t('appointments.dayWithAppointment')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full ring-2 ring-blue-700 dark:ring-blue-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{t('appointments.today')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointments List Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t('appointments.allAppointments')}</CardTitle>
              </CardHeader>

              <CardContent>
                <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as AppointmentFilter)}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="all">{t('appointments.all')}</TabsTrigger>
                    <TabsTrigger value="scheduled">{t('appointments.planned')}</TabsTrigger>
                    <TabsTrigger value="in_progress">{t('appointments.inProgress')}</TabsTrigger>
                    <TabsTrigger value="completed">{t('appointments.completed')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeFilter} className="space-y-3">
                    {filteredAppointments.length === 0 ? (
                      <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center">
                        <Calendar className="size-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {t('appointments.noAppointmentsFound')}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => openModal()}
                          disabled={validatedVehicles.length === 0}
                        >
                          {t('appointments.bookNow')}
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
                                        {appointment.immatriculation ? formatImmatriculation(appointment.immatriculation) : 'Véhicule'}
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
      {/* Booking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!w-[50vw] !max-w-2xl max-h-[88vh] overflow-hidden bg-white border-slate-200 p-0 flex flex-col">
          {/* Header with gradient and animated background - v2 */}
          <div key={`header-${step}`} className="relative overflow-hidden bg-gradient-to-br from-[#0f2543] via-[#17325a] to-[#1b355d] p-3 text-white" style={{ minHeight: '64px' }}>
            {/* Animated floating circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            {/* Animated pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-110">
                  <Calendar className="h-5 w-5 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">{t('appointments.bookAppointment')}</h2>
              </div>
              <div className="text-white text-base font-bold tracking-wide bg-[#1b355d]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 shadow-lg">
                {t('appointments.step')} <span className="text-xl font-extrabold">{step}</span> / <span className="text-xl font-extrabold">3</span>
              </div>
            </div>
          </div>

          {/* Step Indicator with enhanced animations */}
          <div className="px-5 py-2.5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
            <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3].map((item, index) => {
                const state = item < step ? 'done' : item === step ? 'active' : 'idle';
                const labels = ['Véhicule & Service', 'Date & Heure', 'Confirmation'];
                
                return (
                  <div key={item} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`relative flex items-center justify-center size-9 rounded-full font-bold text-xs transition-all duration-500 ${
                          state === 'done'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-sm scale-105'
                            : state === 'active'
                            ? 'bg-gradient-to-br from-[#0f2543] to-[#1b355d] text-white shadow-sm scale-105'
                            : 'bg-slate-200 text-slate-400 scale-90'
                        }`}
                      >
                        {state === 'active' && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0f2543] to-[#1b355d] animate-ping opacity-75" />
                        )}
                        <div className="relative z-10">
                          {state === 'done' ? <CheckCircle className="h-3.5 w-3.5" /> : item}
                        </div>
                      </div>
                      <span className={`text-xs mt-1 font-semibold text-center transition-all duration-300 ${
                        state === 'active' ? 'text-[#0f2543] scale-105' : state === 'done' ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        {labels[index]}
                      </span>
                    </div>
                    {item !== 3 && (
                      <div className="relative h-1 flex-1 mx-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700 ease-out ${
                            state !== 'idle' ? 'translate-x-0' : '-translate-x-full'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          </div>

          {/* Content Area with much bigger height */}
          <div className="overflow-y-auto flex-1 px-5 py-3 custom-scrollbar" style={{ maxHeight: 'calc(88vh - 180px)' }}>
            <div className="max-w-xl mx-auto">

          {globalError && (
            <Alert variant="destructive" className="mb-6 animate-fade-in">
              <AlertTriangle className="size-4" />
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Vehicle & Service */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-sm">
                  <Wrench className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">{t('appointments.selectVehicleAndService')}</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#0f2543]" />
                  {t('appointments.agency')} *
                </label>
                <select
                  value={selectedAgencyId}
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0f2543] focus:ring-2 focus:ring-[#0f2543]/10 focus:outline-none transition-all duration-300 hover:border-slate-300 bg-white shadow-sm"
                >
                  <option value="">{t('appointments.selectAgency')}</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.nom} - {agency.ville}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Car className="h-3 w-3 text-[#0f2543]" />
                  {t('appointments.vehicle')} *
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0f2543] focus:ring-2 focus:ring-[#0f2543]/10 focus:outline-none transition-all duration-300 hover:border-slate-300 bg-white shadow-sm"
                >
                  <option value="">{t('appointments.selectVehicle')}</option>
                  {validatedVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {formatImmatriculation(vehicle.immatriculation)} - {vehicle.marque_nom || ''} {vehicle.modele_nom || ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVehicle && (
                <Card className="bg-gradient-to-br from-[#0f2543]/5 via-[#17325a]/5 to-[#1b355d]/10 border-[#0f2543]/20 animate-fade-in shadow-sm">
                  <CardContent className="p-2 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-sm">
                        <Car className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">
                          {selectedVehicle.marque_nom} {selectedVehicle.modele_nom}
                        </p>
                        <p className="text-xs text-slate-600">
                          {formatImmatriculation(selectedVehicle.immatriculation)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Wrench className="h-3 w-3 text-[#0f2543]" />
                  {t('appointments.serviceType')} *
                </label>
                <select
                  value={selectedServiceSubtypeId}
                  onChange={(e) => setSelectedServiceSubtypeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0f2543] focus:ring-2 focus:ring-[#0f2543]/10 focus:outline-none transition-all duration-300 hover:border-slate-300 bg-white shadow-sm"
                >
                  <option value="">{t('appointments.selectServiceType')}</option>
                  {serviceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Packages Section - Made more compact */}
              {packages.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm border border-slate-200">
                        <img src="/logo-sta.png?v=3" alt="STA" width="20" height="20" className="object-contain" />
                      </div>
                      {t('appointments.packagesAvailable')} <span className="text-xs text-slate-500 font-normal">(Optionnel)</span>
                    </label>
                    {selectedPackageIds.length > 0 && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm animate-fade-in text-xs px-2 py-0.5">
                        {selectedPackageIds.length} {t('appointments.packagesSelected')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1.5 custom-scrollbar">
                    {packages.map((pkg, index) => {
                      const isSelected = selectedPackageIds.includes(pkg.id);
                      return (
                        <Card
                          key={pkg.id}
                          style={{ animationDelay: `${index * 50}ms` }}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in ${
                            isSelected 
                              ? 'border border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm scale-[1.01]' 
                              : 'border border-slate-200 hover:border-[#0f2543] shadow-sm'
                          }`}
                          onClick={() => togglePackage(pkg.id)}
                        >
                          <CardContent className="p-2 pt-2">
                            <div className="flex items-start gap-2">
                              <div className={`mt-0.5 size-4 rounded border flex items-center justify-center transition-all duration-300 ${
                                isSelected 
                                  ? 'border-orange-500 bg-orange-500 scale-110 shadow-sm' 
                                  : 'border-slate-300 hover:border-orange-400'
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="size-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1.5">
                                  <p className="font-bold text-slate-800 text-xs">{pkg.nom}</p>
                                  <Badge variant="outline" className="font-bold text-orange-600 border-orange-600 shadow-sm text-xs whitespace-nowrap px-1.5 py-0">
                                    {pkg.prix.toFixed(3)} TND
                                  </Badge>
                                </div>
                                {pkg.description && (
                                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                    {pkg.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Price Summary - More compact */}
                  {selectedPackageIds.length > 0 && (
                    <Card className="bg-gradient-to-br from-[#0f2543] to-[#1b355d] text-white animate-fade-in border-0 shadow-md">
                      <CardContent className="p-2.5 pt-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/90 font-medium">{t('appointments.estimatedTotalPrice')}</p>
                            <p className="text-xs text-white/70 mt-0.5">
                              {selectedPackageIds.length} {t('appointments.packagesSelectedCount')}
                            </p>
                          </div>
                          <p className="text-2xl font-bold">
                            {totalPrice.toFixed(3)} <span className="text-xs font-semibold">TND</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-sm">
                  <Clock className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">{t('appointments.selectDateAndTime')}</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#0f2543]" />
                  {t('appointments.date')} *
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={minDateISO}
                  className="rounded-lg border border-slate-200 focus:border-[#0f2543] focus:ring-2 focus:ring-[#0f2543]/10 h-8 shadow-sm hover:border-slate-300 transition-all duration-300 text-xs"
                />
              </div>

              {isSlotsLoading ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-700">{t('appointments.timeSlot')} *</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-14 bg-slate-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : slots.length > 0 ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#0f2543]" />
                    {t('appointments.timeSlot')} *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {slots.map((slot, index) => (
                      <button
                        key={slot.hour}
                        type="button"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => selectSlot(slot)}
                        disabled={slot.is_full}
                        className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all duration-300 animate-fade-in ${
                          selectedHour === slot.label
                            ? 'bg-gradient-to-br from-[#0f2543] to-[#1b355d] border-[#0f2543] text-white shadow-md scale-105'
                            : slot.is_full
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-white border-slate-200 hover:border-green-500 hover:shadow-sm hover:scale-105 text-slate-700 shadow-sm'
                        }`}
                      >
                        <div className="relative z-10 flex flex-col items-center">
                          <Clock className={`h-3 w-3 mb-0.5 transition-transform duration-300 ${
                            selectedHour === slot.label ? 'text-white' : slot.is_full ? 'text-slate-400' : 'text-green-600'
                          }`} />
                          <span className="text-xs font-bold">{slot.label}</span>
                          <span className={`text-xs mt-0.5 font-medium ${
                            selectedHour === slot.label ? 'text-white/90' : 'text-slate-500'
                          }`}>
                            {slot.is_full 
                              ? t('appointments.full')
                              : `${slot.available}/${slot.capacity}`
                            }
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert className="border-amber-200 bg-amber-50 animate-fade-in shadow-sm">
                  <AlertTriangle className="size-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    {t('appointments.noSlotsForDate')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t('appointments.additionalNotes')}</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('appointments.specialRequest')}
                  className="min-h-24 rounded-xl border-2 border-slate-200 focus:border-[#0f2543] focus:ring-4 focus:ring-[#0f2543]/10 shadow-sm hover:border-slate-300 transition-all duration-300"
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 text-right font-medium">
                  {notes.length}/500 {t('appointments.characters')}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-sm">
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">{t('appointments.verifyAndConfirm')}</h3>
              </div>

              {isBookingWith24h && (
                <Alert className="border-amber-200 bg-amber-50 shadow-sm animate-fade-in py-2 px-3">
                  <AlertTriangle className="size-3 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-xs">
                    {t('appointments.within24h')}
                  </AlertDescription>
                </Alert>
              )}

              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-3 space-y-2.5 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1 p-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-semibold uppercase tracking-wide">
                        <Car className="h-3 w-3" />
                        {t('appointments.vehicle')}
                      </p>
                      <p className="font-bold text-slate-800 text-xs">
                        {selectedVehicle?.marque_nom} {selectedVehicle?.modele_nom}
                      </p>
                      <p className="text-xs text-slate-600">
                        {selectedVehicle && formatImmatriculation(selectedVehicle.immatriculation)}
                      </p>
                    </div>
                    <div className="space-y-1 p-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-semibold uppercase tracking-wide">
                        <MapPin className="h-3 w-3" />
                        {t('appointments.agency')}
                      </p>
                      <p className="font-bold text-slate-800 text-xs">{selectedAgency?.nom}</p>
                      <p className="text-xs text-slate-600">{selectedAgency?.ville}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-1 p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {t('appointments.service')}
                    </p>
                    <p className="font-bold text-slate-800 text-xs">{selectedService?.label}</p>
                  </div>
                  
                  {selectedPackageIds.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{t('appointments.selectedPackages')}</p>
                        <div className="space-y-1">
                          {selectedPackageIds.map((packageId, index) => {
                            const pkg = packages.find(p => p.id === packageId);
                            if (!pkg) return null;
                            return (
                              <div 
                                key={packageId} 
                                style={{ animationDelay: `${index * 50}ms` }}
                                className="flex items-center justify-between p-1.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 animate-fade-in"
                              >
                                <span className="text-xs text-slate-700 font-semibold">{pkg.nom}</span>
                                <span className="font-bold text-orange-600 text-xs">{pkg.prix.toFixed(3)} TND</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-[#0f2543] to-[#1b355d] rounded-lg text-white mt-1.5 shadow-md">
                          <span className="font-bold text-xs">{t('appointments.estimatedPrice')}</span>
                          <span className="font-bold text-lg">
                            {totalPrice.toFixed(3)} <span className="text-xs">TND</span>
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Separator className="my-2" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <p className="text-xs text-green-600 flex items-center gap-1 font-semibold uppercase tracking-wide">
                        <Calendar className="h-3 w-3" />
                        {t('appointments.date')}
                      </p>
                      <p className="font-bold text-slate-800 text-xs">{selectedDate}</p>
                    </div>
                    <div className="space-y-1 p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <p className="text-xs text-green-600 flex items-center gap-1 font-semibold uppercase tracking-wide">
                        <Clock className="h-3 w-3" />
                        {t('appointments.time')}
                      </p>
                      <p className="font-bold text-slate-800 text-xs">{selectedHour}</p>
                    </div>
                  </div>
                  
                  {notes && (
                    <>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{t('appointments.remarks')}</p>
                        <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 leading-relaxed">{notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </div>

        {/* Footer Buttons - Fixed at bottom */}
        <div className="px-5 py-2.5 bg-gradient-to-b from-white to-slate-50 border-t-2 border-slate-100 flex-shrink-0">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-2.5">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={goBackStep}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl border-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:shadow-md font-semibold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('appointments.back')}
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={goNextStep}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#0f2543] to-[#1b355d] hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold"
            >
              {t('appointments.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={submitAppointment}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('appointments.processing')}
                </>
              ) : (
                <>
                  {t('appointments.confirmAppointment')}
                  <CheckCircle className="size-5 ml-2" />
                </>
              )}
            </Button>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('appointments.detailsTitle')}</DialogTitle>
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
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t('appointments.vehicle')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Car className="size-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-semibold text-sm">
                          {selectedAppointmentDetail.marque_nom} {selectedAppointmentDetail.modele_nom}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedAppointmentDetail.immatriculation && formatImmatriculation(selectedAppointmentDetail.immatriculation)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 dark:bg-slate-900/30">
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t('appointments.agency')}</p>
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
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t('appointments.dateAndTime')}</p>
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
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t('appointments.services')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Wrench className="size-4 text-slate-600 dark:text-slate-400" />
                      <p className="font-semibold text-sm">
                        {appointmentInterventions.length} {t('appointments.servicesCount')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Services List */}
              <div>
                <p className="text-sm font-semibold mb-2">{t('appointments.serviceDetails')}</p>
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
                    <p className="text-sm text-slate-500">{t('appointments.noServiceSpecified')}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedAppointmentDetail.description && (
                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{t('appointments.notes')}</p>
                  <p className="text-sm">{selectedAppointmentDetail.description}</p>
                </div>
              )}

              {/* File Attachments Section */}
              <div className="border-t pt-4">
                <AppointmentAttachments 
                  appointmentId={selectedAppointmentDetail.id}
                  isReadOnly={selectedAppointmentDetail.statut === 'TERMINE' || selectedAppointmentDetail.statut === 'ANNULE'}
                />
              </div>

              {/* Cancel Section */}
              {canCancelAppointment(selectedAppointmentDetail) && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="font-semibold">{t('appointments.cancelAppointment')}</p>
                      <Textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder={t('appointments.cancelReason')}
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
              {t('appointments.close')}
            </Button>
            {selectedAppointmentDetail && selectedAppointmentDetail.statut === 'TERMINE' && (
              <AppointmentFeedback
                appointmentId={selectedAppointmentDetail.id}
                onSuccess={() => {
                  refreshAppointments();
                  closeDetailModal();
                }}
              />
            )}
            {selectedAppointmentDetail && canCancelAppointment(selectedAppointmentDetail) && (
              <Button
                variant="destructive"
                onClick={submitCancelAppointment}
                disabled={isCancelling}
              >
                {isCancelling ? t('appointments.cancelling') : t('appointments.cancelButton')}
                {!isCancelling && <Trash2 className="size-4 ml-2" />}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
