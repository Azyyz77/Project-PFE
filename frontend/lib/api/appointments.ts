import {
  AgenciesResponse,
  CreateAppointmentPayload,
  CreateAppointmentResponse,
  InterventionsResponse,
  MyAppointmentsResponse,
  SlotsResponse,
} from '@/types/appointment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    const response = await fetch(`${API_BASE_URL}/api/appointments/agencies`, {
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
    const response = await fetch(`${API_BASE_URL}/api/appointments/slots?${params.toString()}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/appointments/interventions`, {
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

export async function getMyAppointments(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments/my`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<MyAppointmentsResponse>(response);
    return result.appointments;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function createAppointment(payload: CreateAppointmentPayload, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
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
