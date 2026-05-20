import {
  AgenciesResponse,
  CreateAppointmentPayload,
  CreateAppointmentResponse,
  InterventionsResponse,
  MyAppointmentsResponse,
  SlotsResponse,
  AppointmentDetailsResponse,
  CancelAppointmentPayload,
} from '@/types/appointment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

export async function getAgencies(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/agencies`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<AgenciesResponse>(response);
    return result.agencies;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function getAvailableSlots(agenceId: number, date: string, token: string) {
  try {
    const params = new URLSearchParams({ agenceId: String(agenceId), date });
    const response = await fetch(`${API_BASE_URL}/appointments/slots?${params.toString()}`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<SlotsResponse>(response);
    return result.slots;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function getInterventionCatalog(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/interventions`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<InterventionsResponse>(response);
    return result.interventions;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function getAvailablePackages(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/packages`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ count: number; packages: any[] }>(response);
    return result.packages;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

const appointmentsCache = new Map<string, { promise: Promise<any>; timestamp: number }>();

export async function getMyAppointments(token: string) {
  const now = Date.now();
  const cached = appointmentsCache.get(token);
  if (cached && (now - cached.timestamp < 3000)) {
    return cached.promise;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/my`, {
        method: 'GET',
        headers: buildAuthHeaders(token),
      });

      const result = await parseJson<MyAppointmentsResponse>(response);
      return result.appointments;
    } catch (error) {
      appointmentsCache.delete(token);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Erreur de connexion au serveur');
    }
  })();

  appointmentsCache.set(token, { promise, timestamp: now });
  return promise;
}

export async function createAppointment(payload: CreateAppointmentPayload, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    return await parseJson<CreateAppointmentResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function getAppointmentDetails(appointmentId: number, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    return await parseJson<AppointmentDetailsResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function cancelAppointment(
  appointmentId: number,
  payload: CancelAppointmentPayload,
  token: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    return await parseJson<{ message: string }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

// ============================================================
// NOUVELLES MÉTHODES - Gestion avancée des rendez-vous
// ============================================================

export interface UpdateAppointmentPayload {
  date_heure?: string;
  agence_id?: number;
  description?: string;
  sous_type_ids?: number[];
}

export interface CompleteAppointmentPayload {
  commentaire?: string;
  cout_reel?: number;
}

/**
 * Modifier un rendez-vous existant
 */
export async function updateAppointment(
  appointmentId: number,
  payload: UpdateAppointmentPayload,
  token: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    return await parseJson<{ message: string; appointmentId: number }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Confirmer un rendez-vous (Agent uniquement)
 */
export async function confirmAppointment(appointmentId: number, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/confirm`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
    });

    return await parseJson<{ message: string; appointmentId: number }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Démarrer un rendez-vous (Agent uniquement)
 */
export async function startAppointment(appointmentId: number, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/start`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
    });

    return await parseJson<{ message: string; appointmentId: number; startedAt: string }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Terminer un rendez-vous (Agent uniquement)
 */
export async function completeAppointment(
  appointmentId: number,
  payload: CompleteAppointmentPayload,
  token: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    return await parseJson<{ 
      message: string; 
      appointmentId: number; 
      completedAt: string;
      dureeReelle: string;
    }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}
