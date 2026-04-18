/**
 * API Client for Audit Logs (Admin)
 */

import axios from './axios';

export interface AuditLog {
  id: number;
  utilisateur_id: number;
  utilisateur_nom: string;
  utilisateur_role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entite_type: string;
  entite_id: string | null;
  ancien_valeur: any;
  nouveau_valeur: any;
  description: string;
  ip_address: string;
  user_agent: string;
  endpoint: string;
  methode_http: string;
  date_action: string;
  statut: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  erreur_message: string | null;
}

export interface AuditFilters {
  utilisateur_id?: number;
  action?: string;
  entite_type?: string;
  date_debut?: string;
  date_fin?: string;
  statut?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditStats {
  total_logs: number;
  total_creates: number;
  total_updates: number;
  total_deletes: number;
  total_success: number;
  total_failed: number;
  unique_users: number;
  unique_entity_types: number;
}

export interface TopUser {
  utilisateur_nom: string;
  utilisateur_role: string;
  action_count: number;
}

export interface EntityStat {
  entite_type: string;
  action_count: number;
  creates: number;
  updates: number;
  deletes: number;
}

export const auditAPI = {
  /**
   * Récupérer les logs d'audit avec filtres
   */
  getLogs: async (filters: AuditFilters = {}): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    logs: AuditLog[];
  }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await axios.get(`/admin/audit?${params.toString()}`);
    return response.data;
  },

  /**
   * Récupérer l'historique d'une entité spécifique
   */
  getEntityHistory: async (
    entiteType: string,
    entiteId: string
  ): Promise<{
    entite_type: string;
    entite_id: string;
    count: number;
    history: AuditLog[];
  }> => {
    const response = await axios.get(`/admin/audit/${entiteType}/${entiteId}`);
    return response.data;
  },

  /**
   * Exporter les logs en Excel ou CSV
   */
  exportLogs: async (filters: AuditFilters & { format?: 'excel' | 'csv' } = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/admin/audit/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return await response.blob();
  },

  /**
   * Récupérer les statistiques d'audit
   */
  getStats: async (filters: { date_debut?: string; date_fin?: string } = {}): Promise<{
    stats: AuditStats;
    top_users: TopUser[];
    entity_stats: EntityStat[];
  }> => {
    const params = new URLSearchParams();
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);

    const response = await axios.get(`/admin/audit/stats?${params.toString()}`);
    return response.data;
  },
};
