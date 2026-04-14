import api from './axios';

export interface Color {
  id: number;
  nom: string;
  code_hex?: string;
  actif: boolean;
}

export const colorsApi = {
  // Récupérer toutes les couleurs
  getAllColors: async (): Promise<Color[]> => {
    const response = await api.get('/colors');
    return response.data;
  },

  // Créer une couleur (admin)
  createColor: async (data: Partial<Color>): Promise<{ message: string; id: number }> => {
    const response = await api.post('/colors', data);
    return response.data;
  },

  // Mettre à jour une couleur (admin)
  updateColor: async (id: number, data: Partial<Color>): Promise<{ message: string }> => {
    const response = await api.put(`/colors/${id}`, data);
    return response.data;
  },

  // Supprimer une couleur (admin)
  deleteColor: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/colors/${id}`);
    return response.data;
  },
};
