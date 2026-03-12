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
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Connexion
   */
  const login = async (data: LoginData) => {
    try {
      const response = await loginUser(data);
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      
      // Rediriger vers le dashboard
      router.push('/dashboard');
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
