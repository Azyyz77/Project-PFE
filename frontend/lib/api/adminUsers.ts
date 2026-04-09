const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types
export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  actif: boolean;
  date_creation: string;
  role_nom: string;
  role_id: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_clients: number;
  total_agents: number;
  total_admins: number;
}

export interface Role {
  id: number;
  nom: string;
  description: string | null;
}

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  password: string;
  role_nom: string;
}

export interface UpdateUserPayload {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role_nom?: string;
  actif?: boolean;
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
 * Récupérer tous les utilisateurs
 */
export async function getAllUsers(
  token: string,
  filters?: { role?: string; actif?: boolean; search?: string }
): Promise<AdminUser[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.actif !== undefined) params.append('actif', String(filters.actif));
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/admin/users${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ users: AdminUser[] }>(response);
    return result.users;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Récupérer les statistiques des utilisateurs
 */
export async function getUserStats(token: string): Promise<UserStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/stats`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ stats: UserStats }>(response);
    return result.stats;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Récupérer tous les rôles
 */
export async function getRoles(token: string): Promise<Role[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/roles`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ roles: Role[] }>(response);
    return result.roles;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Créer un nouvel utilisateur
 */
export async function createUser(token: string, payload: CreateUserPayload): Promise<{ userId: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    return await parseJson<{ message: string; userId: number }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Mettre à jour un utilisateur
 */
export async function updateUser(
  token: string,
  userId: number,
  payload: UpdateUserPayload
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    return await parseJson<{ message: string }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Désactiver un utilisateur
 */
export async function deleteUser(token: string, userId: number): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(token),
    });

    return await parseJson<{ message: string }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Réinitialiser le mot de passe d'un utilisateur
 */
export async function resetUserPassword(
  token: string,
  userId: number,
  newPassword: string
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ newPassword }),
    });

    return await parseJson<{ message: string }>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}
