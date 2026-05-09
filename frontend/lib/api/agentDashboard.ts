import api from './axios';
import {
  DashboardSummary, Appointment, Vehicle,
  Complaint, AgentNotification, Statistics
} from '@/types/agentDashboard';

const BASE = '/agent-dashboard';

// ── Dashboard ──────────────────────────────────────────────
export async function fetchSummary(): Promise<DashboardSummary> {
  const r = await api.get(`${BASE}/summary`);
  return r.data.data || r.data;
}

// ── Rendez-vous ────────────────────────────────────────────
export interface AppointmentFilters {
  statut?:    string;
  fromDate?:  string;
  toDate?:    string;
  agenceId?:  number;
}

export async function fetchAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const url = queryString ? `${BASE}/appointments?${queryString}` : `${BASE}/appointments`;
  const r = await api.get(url);
  return r.data.data || r.data;
}

export async function confirmAppointment(id: number) {
  const r = await api.put(`${BASE}/appointments/${id}/confirm`, {});
  return r.data;
}

export async function updateAppointment(id: number, payload: { date_rendez_vous?: string; description?: string }) {
  const r = await api.put(`${BASE}/appointments/${id}/update`, payload);
  return r.data;
}

export async function startIntervention(id: number) {
  const r = await api.put(`${BASE}/appointments/${id}/start`, {});
  return r.data;
}

export async function finishIntervention(id: number, notes?: string) {
  const r = await api.put(`${BASE}/appointments/${id}/finish`, { notes });
  return r.data;
}

export async function cancelAppointment(id: number, reason?: string) {
  const r = await api.put(`${BASE}/appointments/${id}/cancel`, { reason });
  return r.data;
}

// ── Véhicules ──────────────────────────────────────────────
export async function fetchVehicles(statut?: string): Promise<Vehicle[]> {
  const url = statut ? `${BASE}/vehicles?statut=${statut}` : `${BASE}/vehicles`;
  const r = await api.get(url);
  return r.data.data || r.data;
}

export async function fetchVehiclesToValidate(): Promise<Vehicle[]> {
  const r = await api.get(`${BASE}/vehicles/to-validate`);
  return r.data.data || r.data;
}

export async function validateVehicle(id: number) {
  const r = await api.put(`${BASE}/vehicles/${id}/validate`, {});
  return r.data;
}

export async function rejectVehicle(id: number, reason?: string) {
  const r = await api.put(`${BASE}/vehicles/${id}/reject`, { reason });
  return r.data;
}

// ── Réclamations ───────────────────────────────────────────
export async function fetchComplaints(statut?: string): Promise<Complaint[]> {
  const url = statut ? `${BASE}/complaints?statut=${statut}` : `${BASE}/complaints`;
  const r = await api.get(url);
  return r.data.data || r.data;
}

export async function answerComplaint(id: number, response: string) {
  const r = await api.post(`${BASE}/complaints/${id}/answer`, { response });
  return r.data;
}

export async function updateComplaintStatus(id: number, statut: string) {
  const r = await api.put(`${BASE}/complaints/${id}/status`, { statut });
  return r.data;
}

// ── Notifications ──────────────────────────────────────────
export async function fetchNotifications(): Promise<AgentNotification[]> {
  const r = await api.get(`${BASE}/notifications`);
  return r.data.data || r.data;
}

export async function markNotificationRead(id: number) {
  const r = await api.put(`${BASE}/notifications/${id}/read`, {});
  return r.data;
}

export async function markAllNotificationsRead() {
  const r = await api.put(`${BASE}/notifications/read-all`, {});
  return r.data;
}

// ── Statistiques ───────────────────────────────────────────
export async function fetchStatistics(): Promise<Statistics> {
  const r = await api.get(`${BASE}/statistics`);
  return r.data.data || r.data;
}
