const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types
export interface GlobalReport {
  users: {
    total_users: number;
    active_users: number;
    total_clients: number;
    total_agents: number;
  };
  vehicles: {
    total_vehicles: number;
    validated: number;
    pending: number;
  };
  appointments: {
    total_appointments: number;
    completed: number;
    in_progress: number;
    cancelled: number;
  };
  complaints: {
    total_complaints: number;
    open: number;
    resolved: number;
  };
  revenue: {
    total_revenue: number;
    paid_appointments: number;
  };
}

export interface AgencyReport {
  id: number;
  nom: string;
  ville: string;
  total_appointments: number;
  completed_appointments: number;
  total_agents: number;
  total_revenue: number;
}

export interface PeriodReport {
  total_appointments: number;
  completed: number;
  cancelled: number;
  unique_clients: number;
  total_interventions: number;
  total_revenue: number;
  avg_revenue_per_intervention: number;
}

export interface TopIntervention {
  intervention_nom: string;
  type_nom: string;
  nombre_fois: number;
  cout_moyen: number;
  revenu_total: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, result.error || result.message || 'Erreur API');
  }
  return result as T;
}

/**
 * Récupérer le rapport global
 */
export async function getGlobalReport(token: string): Promise<GlobalReport> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/reports/global`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    return await parseJson<GlobalReport>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Récupérer le rapport par agence
 */
export async function getAgencyReport(token: string): Promise<AgencyReport[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/reports/agencies`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ agencies: AgencyReport[] }>(response);
    return result.agencies;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Récupérer le rapport par période
 */
export async function getPeriodReport(
  token: string,
  dateDebut: string,
  dateFin: string
): Promise<PeriodReport> {
  try {
    const params = new URLSearchParams({
      date_debut: dateDebut,
      date_fin: dateFin,
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/reports/period?${params}`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ report: PeriodReport }>(response);
    return result.report;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Récupérer les top interventions
 */
export async function getTopInterventions(token: string): Promise<TopIntervention[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/reports/top-interventions`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ interventions: TopIntervention[] }>(response);
    return result.interventions;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}
