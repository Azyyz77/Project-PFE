import api from './axios';

export interface SousType {
  id: number;
  nom: string;
  duree_estimee?: number;
}

export interface Package {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  duree_estimee?: string;
  actif: boolean;
  sous_types?: SousType[];
}

export const packagesApi = {
  // Récupérer tous les packages
  getAllPackages: async (): Promise<Package[]> => {
    const response = await api.get('/packages');
    return response.data;
  },

  // Suggérer des packages basés sur les sous-types sélectionnés
  suggestPackages: async (sousTypeIds: number[]): Promise<Package[]> => {
    const response = await api.post('/packages/suggest', { sous_type_ids: sousTypeIds });
    return response.data;
  },

  // Créer un package (admin)
  createPackage: async (data: Partial<Package> & { sous_types: number[] }): Promise<{ message: string; id: number }> => {
    const response = await api.post('/packages', data);
    return response.data;
  },

  // Mettre à jour un package (admin)
  updatePackage: async (id: number, data: Partial<Package> & { sous_types: number[] }): Promise<{ message: string }> => {
    const response = await api.put(`/packages/${id}`, data);
    return response.data;
  },

  // Supprimer un package (admin)
  deletePackage: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  },
};
