import api from './axios';

export interface TimeSlot {
  id: number;
  agence_id: number;
  jour_semaine: number;
  heure_ouverture: string;
  heure_fermeture: string;
  capacite: number;
}

export interface AvailableSlot {
  time: string;
  available: number;
  capacity: number;
}

export const timeslotsApi = {
  // Récupérer les créneaux disponibles
  getAvailableSlots: async (agenceId: number, date: string): Promise<AvailableSlot[]> => {
    const response = await api.get(`/timeslots/available?agenceId=${agenceId}&date=${date}`);
    return response.data;
  },

  // Récupérer toutes les plages horaires (admin)
  getAllTimeSlots: async (): Promise<TimeSlot[]> => {
    const response = await api.get('/timeslots');
    return response.data;
  },

  // Récupérer les plages horaires d'une agence (admin)
  getAgencyTimeSlots: async (agenceId: number): Promise<TimeSlot[]> => {
    const response = await api.get(`/timeslots/agency/${agenceId}`);
    return response.data;
  },

  // Créer une plage horaire (admin)
  createTimeSlot: async (data: Partial<TimeSlot>): Promise<{ message: string; id: number }> => {
    const response = await api.post('/timeslots', data);
    return response.data;
  },

  // Mettre à jour une plage horaire (admin)
  updateTimeSlot: async (id: number, data: Partial<TimeSlot>): Promise<{ message: string }> => {
    const response = await api.put(`/timeslots/${id}`, data);
    return response.data;
  },

  // Supprimer une plage horaire (admin)
  deleteTimeSlot: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/timeslots/${id}`);
    return response.data;
  },
};
