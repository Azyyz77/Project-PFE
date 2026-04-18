import api from './axios';

export interface VehicleHistory {
  vehicule_id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  date_achat: string;
  date_creation: string;
  total_rdv: number;
  rdv_termines: number;
  rdv_annules: number;
  total_interventions: number;
  cout_total_interventions: number;
  derniere_intervention: string | null;
  prochain_rdv: string | null;
}

export interface VehicleIntervention {
  id: number;
  date_intervention: string;
  description: string;
  cout_total: number;
  statut: string;
  kilometrage_intervention: number;
  type_intervention: string;
  agence_nom: string;
  agent_nom: string;
}

export interface VehicleAppointment {
  id: number;
  date_rdv: string;
  heure_debut: string;
  heure_fin: string;
  statut: string;
  motif: string;
  notes: string;
  type_intervention: string;
  agence_nom: string;
  agence_adresse: string;
  agent_nom: string;
}

export interface ExportData {
  vehicule: any;
  interventions: VehicleIntervention[];
  rendez_vous: VehicleAppointment[];
  date_export: string;
}

export const vehicleHistoryAPI = {
  /**
   * Obtenir l'historique complet d'un véhicule
   */
  getHistory: async (vehicleId: number): Promise<VehicleHistory> => {
    const response = await api.get(`/vehicles/${vehicleId}/history`);
    return response.data.history;
  },

  /**
   * Obtenir les interventions d'un véhicule
   */
  getInterventions: async (
    vehicleId: number,
    params?: { limit?: number; offset?: number }
  ): Promise<{
    interventions: VehicleIntervention[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(
      `/vehicles/${vehicleId}/interventions?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Obtenir les rendez-vous d'un véhicule
   */
  getAppointments: async (
    vehicleId: number,
    params?: { limit?: number; offset?: number }
  ): Promise<{
    appointments: VehicleAppointment[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(
      `/vehicles/${vehicleId}/appointments?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Exporter l'historique d'un véhicule
   */
  exportHistory: async (
    vehicleId: number,
    format: 'json' | 'pdf' | 'excel' = 'json'
  ): Promise<ExportData> => {
    const response = await api.get(
      `/vehicles/${vehicleId}/history/export?format=${format}`
    );
    return response.data;
  },
};
