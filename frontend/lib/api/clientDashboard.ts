/**
 * lib/api/clientDashboard.ts
 * Couche API pour le Dashboard Client
 */

import axios, { AxiosError } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function headers(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export interface ComplaintData {
  id: number;
  numero: string;
  sujet: string;
  description: string;
  statut: 'SOUMISE' | 'EN_COURS' | 'TRAITEE' | 'CLOTUREE';
  date_creation: string;
  date_traitement?: string;
  date_cloture?: string;
}

// ── Réclamations ───────────────────────────────────────────

export async function submitComplaint(
  token: string,
  data: { sujet: string; description: string }
): Promise<ComplaintData> {
  try {
    const r = await axios.post(
      `${BASE}/client-dashboard/complaints`,
      data,
      { headers: headers(token) }
    );
    return r.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Erreur lors de la création de la réclamation';
    throw new Error(message);
  }
}

export async function fetchClientComplaints(token: string): Promise<ComplaintData[]> {
  try {
    const r = await axios.get(`${BASE}/client-dashboard/complaints`, {
      headers: headers(token)
    });
    return r.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Erreur lors du chargement des réclamations';
    throw new Error(message);
  }
}

