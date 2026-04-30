import api from './axios';

export interface Color {
  id: number;
  nom: string;
  code_hex?: string;
  actif: boolean;
}

// Récupérer toutes les couleurs
export async function getAllColors(): Promise<Color[]> {
  const response = await api.get('/colors');
  return response.data;
}

// Créer une couleur (admin)
export async function createColor(data: Partial<Color>): Promise<{ message: string; id: number }> {
  const response = await api.post('/colors', data);
  return response.data;
}

// Mettre à jour une couleur (admin)
export async function updateColor(id: number, data: Partial<Color>): Promise<{ message: string }> {
  const response = await api.put(`/colors/${id}`, data);
  return response.data;
}

// Supprimer une couleur (admin)
export async function deleteColor(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/colors/${id}`);
  return response.data;
}

// Export de l'objet pour compatibilité
export const colorsApi = {
  getAllColors,
  createColor,
  updateColor,
  deleteColor,
};
