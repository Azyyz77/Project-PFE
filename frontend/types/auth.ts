/**
 * Types TypeScript pour l'authentification
 */

export type UserRole = 'CLIENT' | 'AGENT' | 'ADMIN' | 'DIRECTION';

export interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  type_utilisateur: UserRole;
  actif?: boolean;
  date_creation?: string;
}

export interface RegisterData {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  password: string;
  confirmPassword?: string;
  type_utilisateur?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
