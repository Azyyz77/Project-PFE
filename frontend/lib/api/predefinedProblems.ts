import axios from './axios';

export interface PredefinedProblem {
  id: number;
  nom: string;
  description: string | null;
  solution: string | null;
  categorie: string;
  actif: boolean;
  date_creation: string;
}

export interface ProblemCategory {
  categorie: string;
  count: number;
}

export interface ProblemStats {
  id: number;
  nom: string;
  categorie: string;
  utilisation_count: number;
}

export const predefinedProblemsAPI = {
  // Obtenir tous les problèmes
  getAll: async (filters?: { categorie?: string; actif?: boolean }): Promise<{ count: number; problems: PredefinedProblem[] }> => {
    const queryParams = new URLSearchParams();
    if (filters?.categorie) queryParams.append('categorie', filters.categorie);
    if (filters?.actif !== undefined) queryParams.append('actif', filters.actif.toString());
    
    const url = `/admin/problems${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Obtenir les catégories
  getCategories: async (): Promise<ProblemCategory[]> => {
    const response = await axios.get('/admin/problems/categories');
    return response.data;
  },

  // Obtenir un problème par ID
  getById: async (id: number): Promise<PredefinedProblem> => {
    const response = await axios.get(`/admin/problems/${id}`);
    return response.data;
  },

  // Créer un problème
  create: async (data: { nom: string; description?: string; solution?: string; categorie: string }): Promise<any> => {
    const response = await axios.post('/admin/problems', data);
    return response.data;
  },

  // Mettre à jour un problème
  update: async (id: number, data: Partial<PredefinedProblem>): Promise<any> => {
    const response = await axios.put(`/admin/problems/${id}`, data);
    return response.data;
  },

  // Supprimer un problème
  delete: async (id: number): Promise<any> => {
    const response = await axios.delete(`/admin/problems/${id}`);
    return response.data;
  },

  // Obtenir les statistiques d'utilisation
  getStats: async (): Promise<ProblemStats[]> => {
    const response = await axios.get('/admin/problems/stats/usage');
    return response.data;
  },
};
