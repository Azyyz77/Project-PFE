import axios from './axios';

export interface PendingVehicle {
  id: number;
  immatriculation: string;
  numero_chassis: string;
  couleur: string | null;
  annee: number;
  date_ajout: string;
  statut_validation: string;
  image_vehicule: string | null;
  image_carte_grise: string | null;
  client_id: number;
  client_nom: string;
  client_telephone: string;
  client_email: string;
  marque: string;
  modele: string;
  version_nom: string;
  motorisation: string | null;
  transmission: string | null;
}

export interface ValidationStats {
  total: number;
  en_attente: number;
  valides: number;
  refuses: number;
  delai_moyen_heures: number | null;
}

export const vehicleValidationAPI = {
  // Obtenir les véhicules en attente
  getPending: async (): Promise<{ count: number; vehicles: PendingVehicle[] }> => {
    const response = await axios.get('/agent/vehicles/pending');
    return response.data;
  },

  // Obtenir tous les véhicules avec filtres
  getAll: async (filters?: { statut?: string; client_id?: number }): Promise<{ count: number; vehicles: PendingVehicle[] }> => {
    const response = await axios.get('/agent/vehicles', { params: filters });
    return response.data;
  },

  // Obtenir les statistiques
  getStats: async (): Promise<ValidationStats> => {
    const response = await axios.get('/agent/vehicles/stats');
    return response.data;
  },

  // Valider un véhicule
  validate: async (id: number, commentaire?: string): Promise<any> => {
    const response = await axios.post(`/agent/vehicles/${id}/validate`, { commentaire });
    return response.data;
  },

  // Refuser un véhicule
  reject: async (id: number, raison: string): Promise<any> => {
    const response = await axios.post(`/agent/vehicles/${id}/reject`, { raison });
    return response.data;
  },
};
