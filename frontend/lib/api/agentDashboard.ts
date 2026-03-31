/**
 * lib/api/agentDashboard.ts
 * Couche API pour le Dashboard Agent SAV
 */

import axios from 'axios';
import {
  DashboardSummary, Appointment, Vehicle,
  Complaint, AgentNotification, Statistics
} from '@/types/agentDashboard';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function headers(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Dashboard ──────────────────────────────────────────────
export async function fetchSummary(token: string): Promise<DashboardSummary> {
  const r = await axios.get(`${BASE}/agent-dashboard/summary`, { headers: headers(token) });
  return r.data.data;
}

// ── Rendez-vous ────────────────────────────────────────────
export interface AppointmentFilters {
  statut?:    string;
  fromDate?:  string;
  toDate?:    string;
  agenceId?:  number;
}

export async function fetchAppointments(token: string, filters: AppointmentFilters = {}): Promise<Appointment[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  );
  const r = await axios.get(`${BASE}/agent-dashboard/appointments`, { headers: headers(token), params });
  return r.data.data;
}

export async function confirmAppointment(token: string, id: number) {
  const r = await axios.put(`${BASE}/agent-dashboard/appointments/${id}/confirm`, {}, { headers: headers(token) });
  return r.data;
}

export async function updateAppointment(token: string, id: number, payload: { date_rendez_vous?: string; description?: string }) {
  const r = await axios.put(`${BASE}/agent-dashboard/appointments/${id}/update`, payload, { headers: headers(token) });
  return r.data;
}

export async function startIntervention(token: string, id: number) {
  const r = await axios.put(`${BASE}/agent-dashboard/appointments/${id}/start`, {}, { headers: headers(token) });
  return r.data;
}

export async function finishIntervention(token: string, id: number) {
  const r = await axios.put(`${BASE}/agent-dashboard/appointments/${id}/finish`, {}, { headers: headers(token) });
  return r.data;
}

export async function cancelAppointment(token: string, id: number, reason?: string) {
  const r = await axios.put(`${BASE}/agent-dashboard/appointments/${id}/cancel`, { reason }, { headers: headers(token) });
  return r.data;
}

// ── Véhicules ──────────────────────────────────────────────
export async function fetchVehicles(token: string, statut?: string): Promise<Vehicle[]> {
  const params = statut ? { statut } : {};
  const r = await axios.get(`${BASE}/agent-dashboard/vehicles`, { headers: headers(token), params });
  return r.data.data;
}

export async function fetchVehiclesToValidate(token: string): Promise<Vehicle[]> {
  const r = await axios.get(`${BASE}/agent-dashboard/vehicles/to-validate`, { headers: headers(token) });
  return r.data.data;
}

export async function validateVehicle(token: string, id: number) {
  const r = await axios.put(`${BASE}/agent-dashboard/vehicles/${id}/validate`, {}, { headers: headers(token) });
  return r.data;
}

export async function rejectVehicle(token: string, id: number, reason?: string) {
  const r = await axios.put(`${BASE}/agent-dashboard/vehicles/${id}/reject`, { reason }, { headers: headers(token) });
  return r.data;
}

// ── Réclamations ───────────────────────────────────────────
export async function fetchComplaints(token: string, statut?: string): Promise<Complaint[]> {
  const params = statut ? { statut } : {};
  const r = await axios.get(`${BASE}/agent-dashboard/complaints`, { headers: headers(token), params });
  return r.data.data;
}

export async function answerComplaint(token: string, id: number, response: string) {
  const r = await axios.post(
    `${BASE}/agent-dashboard/complaints/${id}/answer`,
    { response },
    { headers: headers(token) }
  );
  return r.data;
}

export async function updateComplaintStatus(token: string, id: number, statut: string) {
  const r = await axios.put(
    `${BASE}/agent-dashboard/complaints/${id}/status`,
    { statut },
    { headers: headers(token) }
  );
  return r.data;
}

// ── Notifications ──────────────────────────────────────────
export async function fetchNotifications(token: string): Promise<AgentNotification[]> {
  const r = await axios.get(`${BASE}/agent-dashboard/notifications`, { headers: headers(token) });
  return r.data.data;
}

export async function markNotificationRead(token: string, id: number) {
  const r = await axios.put(`${BASE}/agent-dashboard/notifications/${id}/read`, {}, { headers: headers(token) });
  return r.data;
}

export async function markAllNotificationsRead(token: string) {
  const r = await axios.put(`${BASE}/agent-dashboard/notifications/read-all`, {}, { headers: headers(token) });
  return r.data;
}

// ── Statistiques ───────────────────────────────────────────
export async function fetchStatistics(token: string): Promise<Statistics> {
  const r = await axios.get(`${BASE}/agent-dashboard/statistics`, { headers: headers(token) });
  return r.data.data;
}
