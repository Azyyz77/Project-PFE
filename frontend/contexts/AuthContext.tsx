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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Charger les données d'authentification depuis localStorage au démarrage
  useEffect(() => {
    console.log('AuthContext: Initializing...');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    console.log('AuthContext: Stored data', { hasToken: !!storedToken, hasUser: !!storedUser });

    if (storedToken && storedUser) {
      try {
        const parsedUser = normalizeUser(JSON.parse(storedUser));
        console.log('AuthContext: Restoring session', { user: parsedUser });
        setToken(storedToken);
        setUser(parsedUser);
        localStorage.setItem('user', JSON.stringify(parsedUser));
        
        // Sync token to cookie for middleware
        document.cookie = `token=${storedToken}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
      } catch (error) {
        console.error('AuthContext: Error parsing stored user', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
    console.log('AuthContext: Initialization complete');
  }, []);

  /**
   * Connexion
   */
  const login = async (data: LoginData) => {
    try {
      console.log('AuthContext: Login attempt', { email: data.email });
      const response = await loginUser(data);
      console.log('AuthContext: Login response received', { hasToken: !!response.token, hasUser: !!response.user });
      
      const normalizedUser = normalizeUser(response.user);
      console.log('AuthContext: Normalized user', normalizedUser);
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // CRITICAL: Save token to cookies for middleware
      const cookieValue = `token=${response.token}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
      document.cookie = cookieValue;
      console.log('AuthContext: Cookie set', { cookieValue: cookieValue.substring(0, 50) + '...' });
      console.log('AuthContext: All cookies', document.cookie);
      
      setToken(response.token);
      setUser(normalizedUser);
      
      // Redirection basée sur le rôle
      const redirectMap: Record<string, string> = {
        CLIENT: '/client/dashboard',
        AGENT: '/dashboard/agent',
        ADMIN: '/dashboard/admin',
        DIRECTION: '/dashboard/direction',
      };
      
      const redirectUrl = redirectMap[normalizedUser.role] ?? '/login';
      console.log('AuthContext: Redirecting to', redirectUrl);
      
      // Use window.location for a hard redirect to ensure it works
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('AuthContext: Login error', error);
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
      router.replace('/login?registered=true');
    } catch (error) {
      // Propager l'erreur pour que le composant puisse l'afficher
      throw error;
    }
  };

  /**
   * Déconnexion
   */
  const logout = () => {
    console.log('AuthContext: Logging out');
    setIsLoggingOut(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    setToken(null);
    setUser(null);
    
    // Use window.location for hard redirect to ensure clean logout
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isLoggingOut,
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
