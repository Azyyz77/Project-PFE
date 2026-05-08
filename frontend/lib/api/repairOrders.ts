import axios from './axios';
import type { 
  RepairOrder, 
  RepairOrderSummary, 
  CreateLineRequest, 
  UpdateStatusRequest,
  Invoice
} from '@/types/repairOrder';

/**
 * API Client pour les commandes de réparation
 */

export const repairOrdersApi = {
  /**
   * Créer une commande depuis un rendez-vous
   */
  createFromAppointment: async (rdvId: number): Promise<RepairOrder> => {
    const response = await axios.post(`/repair-orders/from-appointment/${rdvId}`);
    return response.data.commande;
  },

  /**
   * Récupérer une commande par ID
   */
  getById: async (id: number): Promise<RepairOrder> => {
    const response = await axios.get(`/repair-orders/${id}`);
    return response.data.commande;
  },

  /**
   * Lister les commandes (avec filtres optionnels)
   */
  list: async (filters?: {
    statut?: string;
    client_id?: number;
    agence_id?: number;
    date_debut?: string;
    date_fin?: string;
  }): Promise<RepairOrderSummary[]> => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const url = queryString ? `/repair-orders?${queryString}` : '/repair-orders';
    const response = await axios.get(url);
    return response.data.commandes;
  },

  /**
   * Ajouter une ligne à la commande
   */
  addLine: async (commandeId: number, line: CreateLineRequest): Promise<void> => {
    await axios.post(`/repair-orders/${commandeId}/lines`, line);
  },

  /**
   * Supprimer une ligne
   */
  deleteLine: async (commandeId: number, ligneId: number): Promise<void> => {
    await axios.delete(`/repair-orders/${commandeId}/lines/${ligneId}`);
  },

  /**
   * Mettre à jour le statut
   */
  updateStatus: async (commandeId: number, data: UpdateStatusRequest): Promise<RepairOrder> => {
    const response = await axios.put(`/repair-orders/${commandeId}/status`, data);
    return response.data.commande;
  },

  /**
   * Créer une facture
   */
  createInvoice: async (commandeId: number): Promise<Invoice> => {
    const response = await axios.post(`/repair-orders/${commandeId}/invoice`);
    return response.data.facture;
  },

  /**
   * Récupérer la facture d'une commande
   */
  getInvoice: async (commandeId: number): Promise<Invoice> => {
    const response = await axios.get(`/repair-orders/${commandeId}/invoice`);
    return response.data.facture;
  },

  /**
   * Mes commandes (pour le client)
   */
  getMyOrders: async (): Promise<RepairOrderSummary[]> => {
    const response = await axios.get('/repair-orders/my');
    return response.data.orders;
  },
};
