/**
 * API pour la gestion des feedbacks et historique de rendez-vous
 */

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function headers(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Feedback ───────────────────────────────────────────────

export interface FeedbackData {
  note: number;
  commentaire?: string;
}

export interface Feedback {
  id: number;
  date_heure: string;
  feedback_note: number;
  feedback_commentaire?: string;
  date_feedback: string;
  client_nom: string;
  client_prenom: string;
  agence_nom: string;
  immatriculation: string;
  marque_nom: string;
  modele_nom: string;
}

export interface FeedbackStats {
  total_feedbacks: number;
  note_moyenne: number;
  note_5: number;
  note_4: number;
  note_3: number;
  note_2: number;
  note_1: number;
}

export async function submitFeedback(token: string, appointmentId: number, data: FeedbackData) {
  const r = await axios.post(
    `${API_BASE}/appointments/${appointmentId}/feedback`,
    data,
    { headers: headers(token) }
  );
  return r.data;
}

export async function getFeedbacks(token: string, filters?: {
  fromDate?: string;
  toDate?: string;
  minNote?: number;
  maxNote?: number;
}): Promise<Feedback[]> {
  const queryParams = new URLSearchParams();
  if (filters?.fromDate) queryParams.append('fromDate', filters.fromDate);
  if (filters?.toDate) queryParams.append('toDate', filters.toDate);
  if (filters?.minNote) queryParams.append('minNote', filters.minNote.toString());
  if (filters?.maxNote) queryParams.append('maxNote', filters.maxNote.toString());
  
  const url = `${API_BASE}/feedbacks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const r = await axios.get(url, {
    headers: headers(token)
  });
  return r.data.feedbacks;
}

export async function getFeedbackStats(token: string): Promise<FeedbackStats> {
  const r = await axios.get(`${API_BASE}/feedbacks/stats`, {
    headers: headers(token)
  });
  return r.data.stats;
}

// ── Historique ─────────────────────────────────────────────

export interface AppointmentHistory {
  appointment: {
    id: number;
    date_creation: string;
    date_modification?: string;
    date_annulation?: string;
    raison_annulation?: string;
    heure_reelle_debut?: string;
    heure_reelle_fin?: string;
    statut: string;
    annule_par_nom?: string;
    annule_par_prenom?: string;
    agent_nom?: string;
    agent_prenom?: string;
  };
  interventions: Array<{
    id: number;
    statut: string;
    sous_type_nom: string;
    type_nom: string;
    date_creation: string;
  }>;
}

export interface DurationStats {
  total_rdv_termines: number;
  duree_moyenne_estimee: number;
  duree_moyenne_reelle: number;
  depassements: number;
  dans_les_temps: number;
}

export interface Cancellation {
  id: number;
  date_heure: string;
  date_annulation: string;
  raison_annulation?: string;
  client_nom: string;
  client_prenom: string;
  annule_par_nom?: string;
  annule_par_prenom?: string;
  role_id?: number;
  agence_nom: string;
}

export async function getAppointmentHistory(token: string, appointmentId: number): Promise<AppointmentHistory> {
  const r = await axios.get(`${API_BASE}/appointments/${appointmentId}/history`, {
    headers: headers(token)
  });
  return r.data;
}

export async function getDurationStats(token: string): Promise<DurationStats> {
  const r = await axios.get(`${API_BASE}/appointments/stats/duration`, {
    headers: headers(token)
  });
  return r.data.stats;
}

export async function getCancellationHistory(token: string, filters?: {
  fromDate?: string;
  toDate?: string;
}): Promise<Cancellation[]> {
  const queryParams = new URLSearchParams();
  if (filters?.fromDate) queryParams.append('fromDate', filters.fromDate);
  if (filters?.toDate) queryParams.append('toDate', filters.toDate);
  
  const url = `${API_BASE}/appointments/cancellations/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const r = await axios.get(url, {
    headers: headers(token)
  });
  return r.data.cancellations;
}
