/**
 * Service API pour l'authentification
 * Gère toutes les requêtes vers le backend auth-service
 */

import { LoginData, RegisterData, AuthResponse, RegisterResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Gestion des erreurs API
 */
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prenom: data.prenom,
        nom: data.nom,
        telephone: data.telephone,
        email: data.email,
        password: data.password,
        type_utilisateur: data.type_utilisateur || 'CLIENT',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur lors de l\'inscription');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Connexion d'un utilisateur
 */
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur lors de la connexion');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Récupération des informations d'un utilisateur
 */
export async function getUserById(id: number, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur lors de la récupération de l\'utilisateur');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}
