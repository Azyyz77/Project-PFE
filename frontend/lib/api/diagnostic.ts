import api from './axios';

export interface DiagnosticProblem {
  id: number;
  nom: string;
  description?: string;
  solution?: string;
  categorie?: string;
  actif: boolean;
}

export const diagnosticApi = {
  // Récupérer tous les problèmes
  getAllProblems: async (): Promise<DiagnosticProblem[]> => {
    const response = await api.get('/diagnostic');
    return response.data;
  },

  // Récupérer les problèmes par catégorie
  getProblemsByCategory: async (categorie: string): Promise<DiagnosticProblem[]> => {
    const response = await api.get(`/diagnostic/category/${categorie}`);
    return response.data;
  },

  // Rechercher des problèmes
  searchProblems: async (query: string): Promise<DiagnosticProblem[]> => {
    if (!query) {
      throw new Error('Requête de recherche requise');
    }
    const response = await api.get(`/diagnostic/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Créer un problème (admin)
  createProblem: async (data: Partial<DiagnosticProblem>): Promise<{ message: string; id: number }> => {
    const response = await api.post('/diagnostic', data);
    return response.data;
  },

  // Mettre à jour un problème (admin)
  updateProblem: async (id: number, data: Partial<DiagnosticProblem>): Promise<{ message: string }> => {
    const response = await api.put(`/diagnostic/${id}`, data);
    return response.data;
  },

  // Supprimer un problème (admin)
  deleteProblem: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/diagnostic/${id}`);
    return response.data;
  },
};
