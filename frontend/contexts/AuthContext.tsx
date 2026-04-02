'use client';

/**
 * Context d'authentification
 * Gère l'état global de l'authentification dans l'application
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginData, RegisterData, AuthContextType } from '@/types/auth';
import { loginUser, registerUser } from '@/lib/api/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(rawUser: any): User {
  return {
    id: rawUser?.id,
    prenom: rawUser?.prenom ?? rawUser?.first_name ?? '',
    nom: rawUser?.nom ?? rawUser?.last_name ?? '',
    email: rawUser?.email ?? '',
    telephone: rawUser?.telephone ?? rawUser?.phone ?? '',
    role: rawUser?.role ?? rawUser?.role_nom ?? 'CLIENT',
    actif: rawUser?.actif ?? rawUser?.is_active,
    date_creation: rawUser?.date_creation ?? rawUser?.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Charger les données d'authentification depuis localStorage au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      const parsedUser = normalizeUser(JSON.parse(storedUser));
      setToken(storedToken);
      setUser(parsedUser);
      localStorage.setItem('user', JSON.stringify(parsedUser));
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Connexion
   */
  const login = async (data: LoginData) => {
    try {
      const response = await loginUser(data);
      const normalizedUser = normalizeUser(response.user);
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      setToken(response.token);
      setUser(normalizedUser);
      
      // Redirection basée sur le rôle
      if (normalizedUser.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (normalizedUser.role === 'AGENT') {
        router.push('/dashboard/agent');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      // Propager l'erreur pour que le composant puisse l'afficher
      throw error;
    }
  };

  /**
   * Inscription
   */
  const register = async (data: RegisterData) => {
    try {
      const response = await registerUser(data);
      
      // Après l'inscription, rediriger vers la page de connexion
      router.push('/login?registered=true');
    } catch (error) {
      // Propager l'erreur pour que le composant puisse l'afficher
      throw error;
    }
  };

  /**
   * Déconnexion
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}
