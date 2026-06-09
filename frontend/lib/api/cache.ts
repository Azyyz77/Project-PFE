// lib/api/cache.ts
// API client pour la gestion du cache Ollama

import api from './axios';

export interface CacheStats {
  enabled: boolean;
  count: number;
  ttl?: number;
  prefix?: string;
  error?: string;
}

export interface CacheClearResponse {
  message: string;
  deletedCount: number;
}

/**
 * Récupère les statistiques du cache Ollama
 * @returns Statistiques du cache
 */
export async function getCacheStats(): Promise<CacheStats> {
  const response = await api.get('/cache/stats');
  return response.data as CacheStats;
}

/**
 * Vide le cache Ollama (réservé aux admins)
 * @returns Résultat de l'opération
 */
export async function clearCache(): Promise<CacheClearResponse> {
  const response = await api.delete('/cache/clear');
  return response.data as CacheClearResponse;
}

/**
 * Hook React pour utiliser les stats du cache
 */
export function useCacheStats() {
  const [stats, setStats] = React.useState<CacheStats | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCacheStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la récupération des stats');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

// Import React pour le hook
import React from 'react';
