/**
 * Service API pour l'authentification
 * Gere toutes les requetes vers le backend
 */

import { LoginData, RegisterData, AuthResponse, RegisterResponse, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

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
        role: data.role || 'CLIENT',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || "Erreur lors de l'inscription");
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

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

export async function getUserById(id: number, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        result.error || "Erreur lors de la recuperation de l'utilisateur"
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function forgotPassword(
  email: string
): Promise<{ message: string; telephone_hint?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur lors de la demande OTP');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ message: string; resetToken: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur de verification OTP');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetToken, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur lors de la reinitialisation');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function updateProfile(
  id: number,
  data: { prenom: string; nom: string; telephone: string },
  token: string
): Promise<{ message: string; user: User }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur de mise a jour du profil');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function changePassword(
  id: number,
  currentPassword: string,
  newPassword: string,
  token: string
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur de changement de mot de passe');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function resendVerificationCode(
  email: string
): Promise<{ message: string; telephone_hint?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur lors du renvoi du code');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

export async function verifyPhoneNumber(
  email: string,
  otp: string
): Promise<{ message: string; verified: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error || 'Erreur de vérification du téléphone');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}
