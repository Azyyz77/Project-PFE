import {
  CreateVehicleData,
  UpdateVehicleData,
  Vehicle,
  VehiclesResponse,
  VersionCatalogItem,
  VersionCatalogResponse,
} from '@/types/vehicle';

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

export async function getVehiclesByUser(userId: number, token: string): Promise<Vehicle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/user/${userId}`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result: VehiclesResponse | { error?: string; message?: string } = await response.json();

    if (!response.ok) {
      const err = result as { error?: string; message?: string };
      throw new ApiError(response.status, err.error || err.message || 'Erreur lors du chargement des véhicules');
    }

    return (result as VehiclesResponse).vehicles;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function createVehicle(data: CreateVehicleData, token: string): Promise<Vehicle> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(data),
    });

    const result: { vehicle?: Vehicle; error?: string; message?: string } = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || result.message || 'Erreur lors de la création du véhicule');
    }

    if (!result.vehicle) {
      throw new ApiError(500, 'Réponse invalide du serveur');
    }

    return result.vehicle;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function updateVehicle(id: number, data: UpdateVehicleData, token: string): Promise<Vehicle> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
      method: 'PUT',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(data),
    });

    const result: { vehicle?: Vehicle; error?: string; message?: string } = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || result.message || 'Erreur lors de la mise à jour du véhicule');
    }

    if (!result.vehicle) {
      throw new ApiError(500, 'Réponse invalide du serveur');
    }

    return result.vehicle;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function deleteVehicle(id: number, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(token),
    });

    const result: { error?: string; message?: string } = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || result.message || 'Erreur lors de la suppression du véhicule');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function getVersionCatalog(token: string): Promise<VersionCatalogItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/catalog/versions`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result: VersionCatalogResponse | { error?: string; message?: string } = await response.json();

    if (!response.ok) {
      const err = result as { error?: string; message?: string };
      throw new ApiError(response.status, err.error || err.message || 'Erreur lors du chargement du catalogue');
    }

    return (result as VersionCatalogResponse).versions;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}
