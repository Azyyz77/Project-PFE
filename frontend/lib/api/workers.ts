/**
 * API pour la gestion des ouvriers et affectations
 */

import api from './axios';

export interface Worker {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  specialite: string;
  niveau_competence: string;
  agence_id: number;
  actif: boolean;
  date_embauche?: string;
  photo_url?: string;
  notes?: string;
  affectations_en_cours?: number;
  agence_nom?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Assignment {
  affectation_id: number;
  statut: string;
  priorite: string;
  date_affectation: string;
  date_debut?: string;
  date_fin?: string;
  temps_estime_minutes?: number;
  temps_reel_minutes?: number;
  evaluation?: number;
  rdv_id: number;
  rdv_date: string;
  rdv_statut: string;
  ouvrier_id: number;
  ouvrier_nom: string;
  ouvrier_prenom: string;
  ouvrier_specialite: string;
  ouvrier_niveau: string;
  client_id: number;
  client_nom: string;
  client_prenom: string;
  vehicule_id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  version?: string;
  agent_id: number;
  agent_nom: string;
  agent_prenom: string;
  agence_id: number;
  agence_nom: string;
}

export interface CreateWorkerData {
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  specialite?: string;
  niveau_competence?: string;
  agence_id: number;
  date_embauche?: string;
  notes?: string;
}

export interface AssignWorkerData {
  rendez_vous_id: number;
  ouvrier_id: number;
  priorite?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  temps_estime_minutes?: number;
  notes_agent?: string;
}

export interface UpdateAssignmentData {
  statut?: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  notes_ouvrier?: string;
  temps_reel_minutes?: number;
  evaluation?: number;
}

export interface WorkerStatistics {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  total_affectations: number;
  affectations_terminees: number;
  affectations_en_cours: number;
  evaluation_moyenne: number;
  temps_moyen_minutes: number;
}

/**
 * Obtenir tous les ouvriers d'une agence
 */
export const getWorkersByAgency = async (
  agenceId: number,
  filters?: { actif?: boolean; specialite?: string }
): Promise<Worker[]> => {
  const params = new URLSearchParams();
  if (filters?.actif !== undefined) params.append('actif', String(filters.actif));
  if (filters?.specialite) params.append('specialite', filters.specialite);

  const response = await api.get(`/workers/agency/${agenceId}?${params.toString()}`);
  return response.data.workers;
};

/**
 * Obtenir tous les ouvriers (Admin uniquement)
 */
export const getAllWorkers = async (
  filters?: { actif?: boolean; specialite?: string; agence_id?: number }
): Promise<Worker[]> => {
  const params = new URLSearchParams();
  if (filters?.actif !== undefined) params.append('actif', String(filters.actif));
  if (filters?.specialite) params.append('specialite', filters.specialite);
  if (filters?.agence_id) params.append('agence_id', String(filters.agence_id));

  const response = await api.get(`/workers?${params.toString()}`);
  return response.data.workers;
};

/**
 * Créer un nouvel ouvrier
 */
export const createWorker = async (data: CreateWorkerData): Promise<Worker> => {
  const response = await api.post('/workers', data);
  return response.data.worker;
};

/**
 * Affecter un ouvrier à un rendez-vous
 */
export const assignWorkerToAppointment = async (data: AssignWorkerData): Promise<Assignment> => {
  const response = await api.post('/workers/assignments', data);
  return response.data.assignment;
};

/**
 * Obtenir les affectations d'un ouvrier
 */
export const getWorkerAssignments = async (
  ouvrierId: number,
  filters?: { statut?: string; date_debut?: string; date_fin?: string }
): Promise<Assignment[]> => {
  const params = new URLSearchParams();
  if (filters?.statut) params.append('statut', filters.statut);
  if (filters?.date_debut) params.append('date_debut', filters.date_debut);
  if (filters?.date_fin) params.append('date_fin', filters.date_fin);

  const response = await api.get(`/workers/${ouvrierId}/assignments?${params.toString()}`);
  return response.data.assignments;
};

/**
 * Obtenir toutes les affectations d'une agence
 */
export const getAgencyAssignments = async (
  agenceId: number,
  filters?: { statut?: string; ouvrier_id?: number }
): Promise<Assignment[]> => {
  const params = new URLSearchParams();
  if (filters?.statut) params.append('statut', filters.statut);
  if (filters?.ouvrier_id) params.append('ouvrier_id', String(filters.ouvrier_id));

  const response = await api.get(`/workers/agency/${agenceId}/assignments?${params.toString()}`);
  return response.data.assignments;
};

/**
 * Obtenir toutes les affectations (Admin uniquement)
 */
export const getAllAssignments = async (
  filters?: { statut?: string; ouvrier_id?: number; agence_id?: number }
): Promise<Assignment[]> => {
  const params = new URLSearchParams();
  if (filters?.statut) params.append('statut', filters.statut);
  if (filters?.ouvrier_id) params.append('ouvrier_id', String(filters.ouvrier_id));
  if (filters?.agence_id) params.append('agence_id', String(filters.agence_id));

  const response = await api.get(`/workers/assignments?${params.toString()}`);
  return response.data.assignments;
};

/**
 * Mettre à jour le statut d'une affectation
 */
export const updateAssignmentStatus = async (
  assignmentId: number,
  data: UpdateAssignmentData
): Promise<Assignment> => {
  const response = await api.put(`/workers/assignments/${assignmentId}`, data);
  return response.data.assignment;
};

/**
 * Obtenir les statistiques des ouvriers d'une agence
 */
export const getWorkerStatistics = async (agenceId: number): Promise<WorkerStatistics[]> => {
  const response = await api.get(`/workers/agency/${agenceId}/statistics`);
  return response.data.statistics;
};

/**
 * Obtenir les ouvriers disponibles pour une date/heure
 */
export const getAvailableWorkers = async (
  agenceId: number,
  date: string,
  heure: string
): Promise<Worker[]> => {
  const response = await api.get(
    `/workers/agency/${agenceId}/available?date=${date}&heure=${heure}`
  );
  return response.data.workers;
};

/**
 * Mettre à jour un ouvrier
 */
export const updateWorker = async (
  workerId: number,
  data: Partial<CreateWorkerData>
): Promise<Worker> => {
  const response = await api.put(`/workers/${workerId}`, data);
  return response.data.worker;
};

/**
 * Désactiver un ouvrier
 */
export const deactivateWorker = async (workerId: number): Promise<void> => {
  await api.put(`/workers/${workerId}`, { actif: false });
};

/**
 * Activer un ouvrier
 */
export const activateWorker = async (workerId: number): Promise<void> => {
  await api.put(`/workers/${workerId}`, { actif: true });
};
