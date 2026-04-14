import api from './axios';

export interface Promotion {
  id: number;
  admin_id: number;
  titre: string;
  description?: string;
  image_url?: string;
  date_debut: string;
  date_fin: string;
  actif: boolean;
  date_creation: string;
  admin_nom?: string;
}

export const promotionsApi = {
  // Récupérer les promotions actives (public)
  getActivePromotions: async (): Promise<Promotion[]> => {
    const response = await api.get('/promotions/active');
    return response.data;
  },

  // Récupérer toutes les promotions (admin)
  getAllPromotions: async (): Promise<Promotion[]> => {
    const response = await api.get('/promotions');
    return response.data;
  },

  // Créer une promotion
  createPromotion: async (data: Partial<Promotion>): Promise<{ message: string; id: number }> => {
    const response = await api.post('/promotions', data);
    return response.data;
  },

  // Mettre à jour une promotion
  updatePromotion: async (id: number, data: Partial<Promotion>): Promise<{ message: string }> => {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data;
  },

  // Supprimer une promotion
  deletePromotion: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  },
};
