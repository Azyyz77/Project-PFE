import axios from './axios';

export type StatusType = 'rdv' | 'intervention' | 'reclamation';

export interface Status {
  code: string;
  libelle: string;
}

export interface StatusWithUsage extends Status {
  usage_count: number;
  percentage: number;
}

export interface AllStatuses {
  rdv: Status[];
  intervention: Status[];
  reclamation: Status[];
}

export interface StatusResponse {
  type: StatusType;
  count: number;
  statuses: Status[];
}

export interface StatusStatsResponse {
  type: StatusType;
  stats: StatusWithUsage[];
}

/**
 * API client pour la gestion des statuts
 */
export const statusesAPI = {
  /**
   * Obtenir tous les statuts de tous les types
   */
  getAll: async (): Promise<AllStatuses> => {
    const response = await axios.get('/admin/statuses');
    return response.data;
  },

  /**
   * Obtenir les statuts d'un type spécifique
   */
  getByType: async (type: StatusType): Promise<StatusResponse> => {
    const response = await axios.get(`/admin/statuses/${type}`);
    return response.data;
  },

  /**
   * Obtenir les statistiques d'utilisation des statuts
   */
  getStats: async (type: StatusType): Promise<StatusStatsResponse> => {
    const response = await axios.get(`/admin/statuses/${type}/stats`);
    return response.data;
  },

  /**
   * Créer un nouveau statut
   */
  create: async (type: StatusType, data: { code: string; libelle: string }): Promise<{ message: string; status: Status }> => {
    const response = await axios.post(`/admin/statuses/${type}`, data);
    return response.data;
  },

  /**
   * Mettre à jour un statut
   */
  update: async (type: StatusType, code: string, libelle: string): Promise<{ message: string; status: Status }> => {
    const response = await axios.put(`/admin/statuses/${type}/${code}`, { libelle });
    return response.data;
  },

  /**
   * Supprimer un statut
   */
  delete: async (type: StatusType, code: string): Promise<{ message: string; code: string }> => {
    const response = await axios.delete(`/admin/statuses/${type}/${code}`);
    return response.data;
  }
};
