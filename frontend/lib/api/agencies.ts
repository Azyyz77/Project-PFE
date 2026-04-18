/**
 * API Client for Agency Management (Admin)
 */

import axios from './axios';

export interface Agency {
  id: number;
  nom: string;
  ville: string;
  telephone?: string;
  adresse?: string;
}

export interface AgencyStats {
  agency_name: string;
  total_rdv: number;
  rdv_termines: number;
  rdv_confirmes: number;
  rdv_en_attente: number;
  rdv_annules: number;
  clients_uniques: number;
  total_agents: number;
  rdv_ce_mois: number;
}

export interface CreateAgencyData {
  nom: string;
  ville: string;
  telephone?: string;
  adresse?: string;
}

export interface UpdateAgencyData extends CreateAgencyData {}

export const agenciesAPI = {
  /**
   * Récupérer toutes les agences
   */
  getAll: async (): Promise<Agency[]> => {
    const response = await axios.get('/admin/agencies');
    return response.data.agencies;
  },

  /**
   * Récupérer une agence par ID
   */
  getById: async (id: number): Promise<Agency> => {
    const response = await axios.get(`/admin/agencies/${id}`);
    return response.data.agency;
  },

  /**
   * Créer une nouvelle agence
   */
  create: async (data: CreateAgencyData): Promise<Agency> => {
    const response = await axios.post('/admin/agencies', data);
    return response.data.agency;
  },

  /**
   * Mettre à jour une agence
   */
  update: async (id: number, data: UpdateAgencyData): Promise<Agency> => {
    const response = await axios.put(`/admin/agencies/${id}`, data);
    return response.data.agency;
  },

  /**
   * Supprimer une agence
   */
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/admin/agencies/${id}`);
  },

  /**
   * Récupérer les statistiques d'une agence
   */
  getStats: async (id: number): Promise<AgencyStats> => {
    const response = await axios.get(`/admin/agencies/${id}/stats`);
    return response.data.stats;
  },
};
