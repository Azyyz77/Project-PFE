'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
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
  Calendar as CalendarIcon,
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
  Zap,
  ArrowRight,
  Gift,
  ShieldCheck,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

        const list = await getMyAppointments(token);
        setAppointments(list);

        if (allAgencies.length > 0) {
          setSelectedAgencyId(String(allAgencies[0].id));
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Impossible de charger les données de rendez-vous.');
        setGlobalError(msg);
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
        setSlots([]);
        return;
      }

      if (isDateInPast(selectedDate)) {
        setSlots([]);
        return;
      }

      setIsSlotsLoading(true);

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
        console.error('Error loading slots:', err);
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

  if (isBootLoading) return <ClientLoadingState message="Préparation de l'agenda..." />;

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => ['PLANIFIE', 'CONFIRME'].includes(a.statut)).length,
    completed: appointments.filter(a => a.statut === 'TERMINE').length
  };

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
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md border border-white/10">
              <CalendarIcon className="h-3.5 w-3.5" />
              Service Client Chery
            </div>
            <h1 className="mb-4 text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Vos <span className="text-red-500">Rendez-vous</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Planifiez vos interventions en quelques clics. Choisissez votre agence, votre véhicule et votre créneau préféré.
            </p>
          </div>

          <div className="flex gap-4">
            <ClientButton
              onClick={() => openModal()}
              disabled={validatedVehicles.length === 0}
              size="large"
              variant="primary"
              icon={Zap}
              className="px-8"
            >
              Réserver maintenant
            </ClientButton>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClientStatCard
          label="Total"
          value={stats.total}
          icon={History}
          iconColor="text-blue-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
        <ClientStatCard
          label="À venir"
          value={stats.upcoming}
          icon={CalendarIcon}
          iconColor="text-red-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
        <ClientStatCard
          label="Terminés"
          value={stats.completed}
          icon={ShieldCheck}
          iconColor="text-emerald-500"
          className="bg-white border-none shadow-xl shadow-slate-100"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* ─── Sidebar Calendar ─── */}
        <div className="space-y-6">
          <ClientCard className="p-8 border-none shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Calendrier</h2>
              <div className="flex gap-1">
                <button 
                  onClick={() => setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <p className="text-center font-black text-slate-400 uppercase tracking-widest text-[10px] mb-6">
              {monthMeta.title}
            </p>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {WEEK_DAYS.map(day => (
                <span key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthMeta.cells.map((cell, idx) => {
                if (!cell.dateISO) return <div key={`empty-${idx}`} />;
                
                const isToday = cell.dateISO === todayISO;
                const isSelected = cell.dateISO === selectedDate;
                const hasAppointment = appointmentDateSet.has(cell.dateISO);
                const isDisabled = isDateInPast(cell.dateISO);

                return (
                  <button
                    key={cell.dateISO}
                    disabled={isDisabled}
                    onClick={() => {
                      setSelectedDate(cell.dateISO as string);
                      openModal(cell.dateISO as string);
                    }}
                    className={`
                      relative h-11 w-full rounded-2xl text-xs font-black transition-all flex items-center justify-center
                      ${isDisabled ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600'}
                      ${isSelected ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : ''}
                      ${isToday && !isSelected ? 'text-red-600 ring-2 ring-red-100 ring-offset-2' : 'text-slate-600'}
                    `}
                  >
                    {cell.day}
                    {hasAppointment && !isDisabled && (
                      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vos rendez-vous</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full ring-2 ring-red-500 ring-offset-2" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aujourd'hui</span>
              </div>
            </div>
          </ClientCard>

          {validatedVehicles.length === 0 && (
            <Alert className="bg-amber-50 border-amber-100 text-amber-700 rounded-3xl p-6">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <AlertDescription className="font-bold text-sm leading-relaxed">
                {t('appointments.vehicleValidationRequired')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* ─── Appointments List ─── */}
        <div className="space-y-6">
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as AppointmentFilter)} className="w-full">
            <TabsList className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-100 h-auto gap-2 border border-slate-50 flex-wrap">
              <TabsTrigger value="all" className="rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white">
                {t('appointments.all')}
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white">
                {t('appointments.planned')}
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white">
                {t('appointments.inProgress')}
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white">
                {t('appointments.completed')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeFilter} className="mt-8 space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredAppointments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ClientEmptyState
                      icon={CalendarIcon}
                      title={t('appointments.noAppointmentsFound')}
                      description="Vous n'avez pas de rendez-vous correspondant à ce filtre."
                      className="bg-white border-none shadow-2xl shadow-slate-100"
                    />
                  </motion.div>
                ) : (
                  filteredAppointments.map((appointment, idx) => {
                    const when = new Date(appointment.date_heure);
                    const day = when.getDate();
                    const month = when.toLocaleDateString('fr-FR', { month: 'short' });
                    const time = when.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    const status = statusInfo(appointment.statut);

                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        layout
                      >
                        <ClientCard 
                          className="group cursor-pointer p-6 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 border-none shadow-xl shadow-slate-100"
                          onClick={() => openDetailModal(appointment.id)}
                        >
                          <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex flex-col items-center justify-center h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors shrink-0">
                              <span className="text-2xl font-black text-slate-800 group-hover:text-red-600 transition-colors leading-none mb-1">{day}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-red-400 transition-colors">{month}</span>
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">
                                  {appointment.interventions?.[0]?.sous_type_nom || 'Rendez-vous de service'}
                                </h3>
                                <Badge className={`${status.badge} rounded-full border-none px-3 py-0.5 text-[10px] font-black uppercase tracking-widest`}>
                                  {status.label}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-6">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                    <Car className="h-4 w-4 text-slate-400" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 tracking-tight">{appointment.immatriculation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 tracking-tight">{appointment.agence_nom}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 tracking-tight">{time}</span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-500/30">
                                <ChevronRight className="h-6 w-6" />
                              </div>
                            </div>
                          </div>
                        </ClientCard>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ─── Booking Dialog ─── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl rounded-[3rem] p-0 border-none bg-slate-50 overflow-hidden">
          <div className="relative h-40 bg-[#0b1221] p-10 flex items-end">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-red-600/20 blur-[60px]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white tracking-tight">{t('appointments.bookAppointment')}</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Étape {step} sur 3</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-10">
            {/* Step Indicator */}
            <div className="flex gap-4 mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden relative">
                  <motion.div
                    className="absolute inset-0 bg-red-600"
                    initial={{ x: '-100%' }}
                    animate={{ x: s <= step ? '0%' : '-100%' }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('appointments.agency')} *</label>
                      <select
                        value={selectedAgencyId}
                        onChange={(e) => setSelectedAgencyId(e.target.value)}
                        className="w-full rounded-2xl bg-white border border-slate-100 p-4 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                      >
                        <option value="">{t('appointments.selectAgency')}</option>
                        {agencies.map((agency) => (
                          <option key={agency.id} value={agency.id}>{agency.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('appointments.vehicle')} *</label>
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="w-full rounded-2xl bg-white border border-slate-100 p-4 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                      >
                        <option value="">{t('appointments.selectVehicle')}</option>
                        {validatedVehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.immatriculation} - {vehicle.modele_nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('appointments.serviceType')} *</label>
                    <select
                      value={selectedServiceSubtypeId}
                      onChange={(e) => setSelectedServiceSubtypeId(e.target.value)}
                      className="w-full rounded-2xl bg-white border border-slate-100 p-4 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                    >
                      <option value="">{t('appointments.selectServiceType')}</option>
                      {serviceOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {packages.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('appointments.packagesAvailable')}</label>
                        {selectedPackageIds.length > 0 && (
                          <Badge className="bg-red-50 text-red-600 rounded-full border-none font-black text-[10px] px-3">
                            {selectedPackageIds.length} SÉLECTIONNÉS
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {packages.map((pkg) => {
                          const isSelected = selectedPackageIds.includes(pkg.id);
                          return (
                            <div 
                              key={pkg.id}
                              onClick={() => togglePackage(pkg.id)}
                              className={`
                                cursor-pointer p-6 rounded-[2rem] border-2 transition-all group
                                ${isSelected ? 'bg-white border-red-600 shadow-xl shadow-red-500/10' : 'bg-white border-white hover:border-slate-200'}
                              `}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500'}`}>
                                    <Gift className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-800 tracking-tight leading-none mb-1">{pkg.nom}</p>
                                    <p className="text-xs text-slate-400 font-medium line-clamp-1">{pkg.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-red-600 tracking-tight">{pkg.prix.toFixed(3)}</p>
                                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">TND</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('appointments.date')} *</label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={minDateISO}
                        className="rounded-2xl bg-white border border-slate-100 py-8 px-6 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('appointments.timeSlot')} *</label>
                    {isSlotsLoading ? (
                      <div className="grid grid-cols-4 gap-4">
                        {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-14 rounded-2xl bg-slate-200 animate-pulse" />)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-4">
                        {slots.map((slot) => (
                          <button
                            key={slot.label}
                            onClick={() => !slot.is_full && setSelectedHour(slot.label)}
                            className={`
                              p-4 rounded-2xl font-black text-sm transition-all border-2
                              ${slot.is_full ? 'bg-slate-50 border-slate-50 text-slate-200 cursor-not-allowed' : ''}
                              ${!slot.is_full && selectedHour === slot.label ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-500/20' : ''}
                              ${!slot.is_full && selectedHour !== slot.label ? 'bg-white border-white text-slate-700 hover:border-red-100 hover:bg-red-50' : ''}
                            `}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('appointments.additionalNotes')}</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Indiquez ici toute information utile..."
                      className="rounded-2xl bg-white border border-slate-100 p-6 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-red-500/10 transition-all outline-none min-h-[120px]"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Véhicule</p>
                        <p className="font-black text-slate-800 tracking-tight">{selectedVehicle?.marque_nom} {selectedVehicle?.modele_nom}</p>
                        <p className="text-xs font-bold text-red-500">{selectedVehicle?.immatriculation}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agence</p>
                        <p className="font-black text-slate-800 tracking-tight">{selectedAgency?.nom}</p>
                        <p className="text-xs font-bold text-slate-400">{selectedAgency?.ville}</p>
                      </div>
                    </div>

                    <Separator className="bg-slate-50" />

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure</p>
                        <p className="font-black text-slate-800 tracking-tight">{selectedDate}</p>
                        <p className="text-xs font-bold text-red-500">{selectedHour}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervention</p>
                        <p className="font-black text-slate-800 tracking-tight">{selectedService?.label}</p>
                      </div>
                    </div>

                    {selectedPackageIds.length > 0 && (
                      <>
                        <Separator className="bg-slate-50" />
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forfaits inclus</p>
                          {selectedPackageIds.map(id => {
                            const pkg = packages.find(p => p.id === id);
                            return (
                              <div key={id} className="flex items-center justify-between">
                                <span className="font-bold text-sm text-slate-700">{pkg?.nom}</span>
                                <span className="font-black text-red-600">{pkg?.prix.toFixed(3)} TND</span>
                              </div>
                            );
                          })}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className="font-black text-lg text-slate-800 tracking-tight">Total estimé</span>
                            <span className="text-2xl font-black text-red-600 tracking-tight">{totalPrice.toFixed(3)} TND</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {globalError && (
              <Alert className="mt-8 bg-red-50 border-red-100 text-red-600 rounded-2xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-bold">{globalError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 mt-12">
              {step > 1 && (
                <ClientButton
                  variant="secondary"
                  size="large"
                  fullWidth
                  onClick={goBackStep}
                  icon={ChevronLeft}
                >
                  Précédent
                </ClientButton>
              )}
              <ClientButton
                variant={step === 3 ? "primary" : "secondary"}
                size="large"
                fullWidth
                onClick={step === 3 ? submitAppointment : goNextStep}
                disabled={isSubmitting}
                icon={step === 3 ? (isSubmitting ? undefined : CheckCircle) : ArrowRight}
              >
                {isSubmitting ? 'Réservation...' : (step === 3 ? 'Confirmer le RDV' : 'Continuer')}
              </ClientButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl rounded-[3rem] p-0 border-none bg-slate-50 overflow-hidden">
          <div className="relative h-48 bg-[#0b1221] p-10 flex items-end">
            <div className="absolute top-0 left-0 -ml-10 -mt-10 h-40 w-40 rounded-full bg-blue-600/20 blur-[60px]" />
            <div className="relative z-10 flex items-center justify-between w-full">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Détails du Rendez-vous</h2>
                <div className="flex gap-2 mt-2">
                  <Badge className={`${statusInfo(selectedAppointmentDetail?.statut || '').badge} rounded-full border-none font-black text-[10px] px-3`}>
                    {statusInfo(selectedAppointmentDetail?.statut || '').label}
                  </Badge>
                </div>
              </div>
              <button 
                onClick={closeDetailModal}
                className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-10 space-y-8">
            {selectedAppointmentDetail && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ClientCard className="p-6 border-none shadow-sm bg-white rounded-[2rem]">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                        <Car className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Véhicule</p>
                        <p className="font-black text-slate-800 tracking-tight">{selectedAppointmentDetail.marque_nom} {selectedAppointmentDetail.modele_nom}</p>
                        <p className="text-xs font-bold text-red-500">{selectedAppointmentDetail.immatriculation}</p>
                      </div>
                    </div>
                  </ClientCard>

                  <ClientCard className="p-6 border-none shadow-sm bg-white rounded-[2rem]">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <MapPin className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agence</p>
                        <p className="font-black text-slate-800 tracking-tight">{selectedAppointmentDetail.agence_nom}</p>
                        <p className="text-xs font-bold text-slate-400">{selectedAppointmentDetail.agence_ville}</p>
                      </div>
                    </div>
                  </ClientCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ClientCard className="p-6 border-none shadow-sm bg-white rounded-[2rem]">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Clock className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure</p>
                        <p className="font-black text-slate-800 tracking-tight">
                          {new Date(selectedAppointmentDetail.date_heure).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </ClientCard>

                  <ClientCard className="p-6 border-none shadow-sm bg-white rounded-[2rem]">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Wrench className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervention</p>
                        <p className="font-black text-slate-800 tracking-tight">
                          {appointmentInterventions[0]?.sous_type_nom || 'Service général'}
                        </p>
                      </div>
                    </div>
                  </ClientCard>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents & Pièces Jointes</p>
                  <AppointmentAttachments 
                    appointmentId={selectedAppointmentDetail.id}
                    isReadOnly={selectedAppointmentDetail.statut === 'TERMINE' || selectedAppointmentDetail.statut === 'ANNULE'}
                  />
                </div>

                {selectedAppointmentDetail.description && (
                  <div className="bg-slate-100 rounded-[2rem] p-8 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes du client</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{selectedAppointmentDetail.description}"</p>
                  </div>
                )}

                {canCancelAppointment(selectedAppointmentDetail) && (
                  <div className="pt-6 border-t border-slate-200 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <p className="text-sm font-black uppercase tracking-widest">Annulation du rendez-vous</p>
                      </div>
                      <Textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Veuillez indiquer la raison de l'annulation..."
                        className="rounded-2xl bg-white border border-slate-100 p-6 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-red-500/10 transition-all outline-none min-h-[100px]"
                      />
                    </div>
                    <ClientButton
                      variant="danger"
                      size="large"
                      fullWidth
                      onClick={submitCancelAppointment}
                      disabled={isCancelling}
                      icon={Trash2}
                    >
                      {isCancelling ? 'Annulation en cours...' : 'Annuler le rendez-vous'}
                    </ClientButton>
                  </div>
                )}

                {selectedAppointmentDetail.statut === 'TERMINE' && (
                  <div className="pt-6 border-t border-slate-200">
                    <AppointmentFeedback
                      appointmentId={selectedAppointmentDetail.id}
                      onSuccess={() => {
                        refreshAppointments();
                        closeDetailModal();
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ClientPageWrapper>
  );
}

