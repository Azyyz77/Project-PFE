'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

type AppointmentFilter = 'all' | 'scheduled' | 'in_progress' | 'completed';
type BookingStep = 1 | 2 | 3;

type ServiceOption = {
  id: number;
  label: string;
  typeName: string;
  subTypeName: string;
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  const [success, setSuccess] = useState('');

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
  const minDateISO = todayISO; // Can't book for past dates

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

  const loadAppointments = useCallback(async () => {
    if (!token) return;
    const list = await getMyAppointments(token);
    setAppointments(list);
  }, [token]);

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
        await loadAppointments();

        if (allAgencies.length > 0) {
          setSelectedAgencyId(String(allAgencies[0].id));
        }
      } catch (err: unknown) {
        setGlobalError(getErrorMessage(err, 'Unable to load appointment data.'));
      } finally {
        setIsBootLoading(false);
      }
    };

    bootstrap();
  }, [loadAppointments, token, user]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!token || !selectedAgencyId || !selectedDate) {
        setSlots([]);
        setSelectedHour('');
        return;
      }

      // Validate date
      if (!isDateValid(selectedDate)) {
        setGlobalError('Invalid date selected.');
        setSlots([]);
        return;
      }

      if (isDateInPast(selectedDate)) {
        setGlobalError('Cannot book appointments for past dates.');
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
        setGlobalError(getErrorMessage(err, 'Unable to load available time slots.'));
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
      title: monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      cells,
    };
  }, [monthCursor]);

  const goNextStep = () => {
    if (step === 1) {
      if (!selectedVehicleId || !selectedServiceSubtypeId || !selectedAgencyId) {
        setGlobalError('Please select vehicle, agency and service type.');
        return;
      }
      setGlobalError('');
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedDate || !selectedHour) {
        setGlobalError('Please choose date and time slot.');
        return;
      }
      if (isDateInPast(selectedDate)) {
        setGlobalError('Cannot book appointments for past dates.');
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
    setSuccess('');
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
      setGlobalError(getErrorMessage(err, 'Unable to load appointment details.'));
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
      setGlobalError('Missing required booking fields.');
      return;
    }

    if (isDateInPast(selectedDate)) {
      setGlobalError('Cannot book appointments for past dates.');
      return;
    }

    try {
      setIsSubmitting(true);
      setGlobalError('');
      setSuccess('');

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

      setSuccess('Appointment booked successfully.');
      await loadAppointments();
      closeModal();
    } catch (err: unknown) {
      setGlobalError(getErrorMessage(err, 'This time slot is not available. Please choose another hour.'));
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

      setSuccess('Appointment cancelled successfully.');
      await loadAppointments();
      closeDetailModal();
    } catch (err: unknown) {
      setGlobalError(getErrorMessage(err, 'Unable to cancel appointment.'));
    } finally {
      setIsCancelling(false);
    }
  };

  const statusInfo = (status: string) => {
    if (status === 'EN_COURS') return { label: 'In Progress', badge: 'bg-amber-100 text-amber-700' };
    if (status === 'TERMINE') return { label: 'Completed', badge: 'bg-emerald-100 text-emerald-700' };
    if (status === 'ANNULE') return { label: 'Cancelled', badge: 'bg-red-100 text-red-700' };
    if (status === 'CONFIRME' || status === 'PLANIFIE') {
      return { label: 'Scheduled', badge: 'bg-blue-100 text-blue-700' };
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

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#f3f6fb] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0c2c5d]">Appointments</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and book your service appointments.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => openModal()}
              className="rounded-xl bg-[#ff6b00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ef6400]"
            >
              + Book Appointment
            </button>
          </div>
        </header>

        {globalError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
        )}

        {isBootLoading ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
            Loading appointment data...
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                  className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
                >
                  {'<'}
                </button>
                <h2 className="text-xl font-semibold capitalize text-[#0c2c5d]">{monthMeta.title}</h2>
                <button
                  type="button"
                  onClick={() =>
                    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                  className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
                >
                  {'>'}
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-slate-400">
                {WEEK_DAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {monthMeta.cells.map((cell, index) => {
                  if (!cell.dateISO || !cell.day) {
                    return <div key={`empty-${index}`} className="h-10" />;
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
                      className={`relative h-10 rounded-lg text-sm font-semibold transition ${
                        isDisabled
                          ? 'cursor-not-allowed text-slate-300'
                          : isSelected
                          ? 'bg-[#ff6b00] text-white'
                          : isToday
                          ? 'bg-[#102f63] text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cell.day}
                      {hasAppointment && !isDisabled && (
                        <span
                          className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                            isSelected || isToday ? 'bg-white' : 'bg-red-500'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Day with appointment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#102f63]" />
                  <span>Today</span>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-[#0c2c5d]">All Appointments</h2>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      activeFilter === 'all' ? 'bg-[#102f63] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('scheduled')}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      activeFilter === 'scheduled' ? 'bg-[#102f63] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Scheduled
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('in_progress')}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      activeFilter === 'in_progress' ? 'bg-[#102f63] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('completed')}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      activeFilter === 'completed' ? 'bg-[#102f63] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {filteredAppointments.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                  No appointments found for this filter.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => {
                    const when = new Date(appointment.date_heure);
                    const dayNumber = when.getDate();
                    const monthLabel = when.toLocaleDateString(undefined, { month: 'short' });
                    const timeLabel = when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const status = statusInfo(appointment.statut);

                    return (
                      <button
                        key={appointment.id}
                        type="button"
                        onClick={() => openDetailModal(appointment.id)}
                        className="w-full text-left transition hover:bg-slate-50"
                      >
                        <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                              <span className="text-xl font-bold">{dayNumber}</span>
                              <span className="text-xs uppercase">{monthLabel}</span>
                            </div>

                            <div>
                              <p className="text-lg font-semibold text-[#102f63]">
                                {appointment.interventions?.[0]
                                  ? `${appointment.interventions[0].type_nom} - ${appointment.interventions[0].sous_type_nom}`
                                  : 'Service appointment'}
                              </p>
                              <p className="text-sm text-slate-500">
                                {appointment.immatriculation || 'Vehicle'} | {appointment.agence_nom || 'Agency'}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">{timeLabel}</p>
                            </div>
                          </div>

                          <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${status.badge}`}>
                            {status.label}
                          </span>
                        </article>
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          </section>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-[#183a74] px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-4xl font-bold leading-none">Book Appointment</h3>
                  <p className="mt-1 text-base text-slate-200">Step {step} of 3</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-2 py-1 text-2xl text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  x
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <ol className="flex items-center gap-4">
                {[1, 2, 3].map((item) => {
                  const state = item < step ? 'done' : item === step ? 'active' : 'idle';
                  return (
                    <li key={item} className="flex flex-1 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          state === 'done'
                            ? 'bg-[#102f63] text-white'
                            : state === 'active'
                            ? 'bg-[#102f63] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {state === 'done' ? 'v' : item}
                      </span>
                      {item !== 3 && <span className="h-[2px] flex-1 bg-slate-200" />}
                    </li>
                  );
                })}
              </ol>

              {globalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {globalError}
                </div>
              )}

              {step === 1 && (
                <section className="space-y-4">
                  <h4 className="text-3xl font-bold text-[#102f63]">Select Vehicle and Service</h4>

                  <label className="block space-y-2 text-sm">
                    <span className="font-semibold text-slate-700">Agency</span>
                    <select
                      value={selectedAgencyId}
                      onChange={(e) => setSelectedAgencyId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
                    >
                      <option value="">Select agency</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.nom} - {agency.ville}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2 text-sm">
                    <span className="font-semibold text-slate-700">Vehicle</span>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
                    >
                      <option value="">Select your vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.immatriculation} - {vehicle.marque_nom || ''} {vehicle.modele_nom || ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2 text-sm">
                    <span className="font-semibold text-slate-700">Service Type</span>
                    <select
                      value={selectedServiceSubtypeId}
                      onChange={(e) => setSelectedServiceSubtypeId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
                    >
                      <option value="">Select service type</option>
                      {serviceOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-4">
                  <h4 className="text-3xl font-bold text-[#102f63]">Select Date and Time</h4>

                  <label className="block space-y-2 text-sm">
                    <span className="font-semibold text-slate-700">Date</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={minDateISO}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
                    />
                  </label>

                  {isSlotsLoading ? (
                    <p className="text-sm text-slate-500">Loading available time slots...</p>
                  ) : slots.length > 0 ? (
                    <label className="block space-y-2 text-sm">
                      <span className="font-semibold text-slate-700">Time Slot</span>
                      <select
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
                      >
                        <option value="">Select time</option>
                        {slots.map((slot) => (
                          <option key={slot.hour} value={slot.label} disabled={slot.is_full}>
                            {slot.label} {slot.is_full ? '(Full)' : `(${slot.available}/${slot.capacity})`}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      No available slots for this date and agency.
                    </p>
                  )}

                  <label className="block space-y-2 text-sm">
                    <span className="font-semibold text-slate-700">Additional Notes (Optional)</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or comments..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
                      rows={3}
                    />
                  </label>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-4">
                  <h4 className="text-3xl font-bold text-[#102f63]">Review & Confirm</h4>

                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm text-slate-600">Vehicle</p>
                      <p className="font-semibold text-slate-900">{selectedVehicle?.marque_nom} {selectedVehicle?.modele_nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Agency</p>
                      <p className="font-semibold text-slate-900">{selectedAgency?.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Service</p>
                      <p className="font-semibold text-slate-900">{selectedService?.label}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Date & Time</p>
                      <p className="font-semibold text-slate-900">
                        {selectedDate} at {selectedHour}
                      </p>
                    </div>
                    {notes && (
                      <div>
                        <p className="text-sm text-slate-600">Notes</p>
                        <p className="font-semibold text-slate-900">{notes}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBackStep}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={step === 3 ? submitAppointment : goNextStep}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-[#ff6b00] px-4 py-2.5 font-semibold text-white hover:bg-[#ef6400] disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : step === 3 ? 'Confirm Booking' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedAppointmentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-[#183a74] px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold leading-none">Appointment Details</h3>
                </div>
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="rounded-lg px-2 py-1 text-2xl text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  x
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              {globalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {globalError}
                </div>
              )}

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className={`mt-1 rounded-full px-3 py-1 text-sm font-semibold w-fit ${statusInfo(selectedAppointmentDetail.statut).badge}`}>
                      {statusInfo(selectedAppointmentDetail.statut).label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Date & Time</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {new Date(selectedAppointmentDetail.date_heure).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Vehicle</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedAppointmentDetail.marque_nom} {selectedAppointmentDetail.modele_nom}
                    </p>
                    <p className="text-xs text-slate-500">{selectedAppointmentDetail.immatriculation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Agency</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedAppointmentDetail.agence_nom}</p>
                    <p className="text-xs text-slate-500">{selectedAppointmentDetail.agence_ville}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Services</p>
                  <div className="mt-2 space-y-2">
                    {appointmentInterventions.length > 0 ? (
                      appointmentInterventions.map((intervention) => (
                        <div key={intervention.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="font-semibold text-slate-900">{intervention.type_nom}</p>
                          <p className="text-sm text-slate-600">{intervention.sous_type_nom}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No services specified</p>
                    )}
                  </div>
                </div>

                {selectedAppointmentDetail.description && (
                  <div>
                    <p className="text-sm text-slate-600">Notes</p>
                    <p className="mt-1 text-slate-900">{selectedAppointmentDetail.description}</p>
                  </div>
                )}

                {canCancelAppointment(selectedAppointmentDetail) && (
                  <div>
                    <label className="block space-y-2 text-sm">
                      <span className="font-semibold text-slate-700">Cancellation Reason (Optional)</span>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Why are you cancelling this appointment?"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
                        rows={2}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  disabled={isCancelling}
                >
                  Close
                </button>
                {canCancelAppointment(selectedAppointmentDetail) && (
                  <button
                    type="button"
                    onClick={submitCancelAppointment}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
