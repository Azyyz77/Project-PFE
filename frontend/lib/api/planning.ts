/**
 * lib/api/planning.ts
 * API client for the agent planning feature
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const PLANNING_BASE = `${API_BASE}/api/agent/planning`;

function buildHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data.error || data.message || 'Erreur API');
  return data as T;
}

// ─── Types ────────────────────────────────────────────────

export interface PlanningRDV {
  rdv_id: number;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  vehicule_immatriculation: string;
  vehicule_marque: string;
  vehicule_modele: string;
  agence_id: number;
  agence_nom: string;
  agence_ville: string;
  date_heure: string;
  statut: string;
  description?: string;
  duree_estimee?: number;
  type_intervention?: string;
  sous_type_intervention?: string;
  agent_id?: number;
  agent_nom?: string;
  agent_prenom?: string;
}

export interface PlanningAgency {
  id: number;
  nom: string;
  ville: string;
  telephone?: string;
  adresse?: string;
}

// ─── API functions ────────────────────────────────────────

export async function fetchPlanning(
  token: string,
  dateDebut: string,
  dateFin: string,
  agenceId?: number
): Promise<PlanningRDV[]> {
  const params = new URLSearchParams({ dateDebut, dateFin });
  if (agenceId) params.set('agenceId', String(agenceId));

  const res = await fetch(`${PLANNING_BASE}?${params}`, {
    headers: buildHeaders(token),
  });
  const result = await parseJson<{ data: PlanningRDV[] }>(res);
  return result.data;
}

export async function fetchAgentPlanning(
  token: string,
  agentId: number,
  date: string
): Promise<PlanningRDV[]> {
  const res = await fetch(`${PLANNING_BASE}/agent/${agentId}?date=${date}`, {
    headers: buildHeaders(token),
  });
  const result = await parseJson<{ data: PlanningRDV[] }>(res);
  return result.data;
}

export async function moveAppointment(
  token: string,
  rdvId: number,
  newDateTime: string
): Promise<{ message: string; appointmentId: number; newDateTime: string }> {
  const res = await fetch(`${PLANNING_BASE}/rdv/${rdvId}/move`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({ newDateTime }),
  });
  return parseJson(res);
}

export async function fetchPlanningAgencies(token: string): Promise<PlanningAgency[]> {
  const res = await fetch(`${PLANNING_BASE}/agencies`, {
    headers: buildHeaders(token),
  });
  const result = await parseJson<{ data: PlanningAgency[] }>(res);
  return result.data;
}
