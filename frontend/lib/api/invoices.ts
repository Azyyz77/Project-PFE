import axios from './axios';
import type { 
  Invoice, 
  InvoiceSummary, 
  UpdateInvoiceStatusRequest,
  InvoiceFilters
} from '@/types/invoice';

/**
 * API Client pour les factures
 */

export const invoicesApi = {
  /**
   * Lister les factures (avec filtres optionnels)
   */
  list: async (filters?: InvoiceFilters): Promise<InvoiceSummary[]> => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const url = queryString ? `/invoices?${queryString}` : '/invoices';
    const response = await axios.get(url);
    return response.data.factures;
  },

  /**
   * Récupérer une facture par ID
   */
  getById: async (id: number): Promise<Invoice> => {
    const response = await axios.get(`/invoices/${id}`);
    return response.data.facture;
  },

  /**
   * Récupérer la facture d'une commande
   */
  getByCommandeId: async (commandeId: number): Promise<Invoice> => {
    const response = await axios.get(`/repair-orders/${commandeId}/invoice`);
    return response.data.facture;
  },

  /**
   * Mettre à jour le statut d'une facture
   */
  updateStatus: async (id: number, data: UpdateInvoiceStatusRequest): Promise<Invoice> => {
    const response = await axios.put(`/invoices/${id}/status`, data);
    return response.data.facture;
  },

  /**
   * Envoyer la facture par email au client
   */
  sendByEmail: async (id: number): Promise<void> => {
    await axios.post(`/invoices/${id}/send`);
  },

  /**
   * Télécharger la facture en PDF
   */
  downloadPDF: async (id: number): Promise<Blob> => {
    // Use native fetch for blob responses since our axios wrapper doesn't support it
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/pdf`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'Erreur réseau', message: `HTTP ${response.status}` };
      }
      throw new Error(errorData.error || errorData.message || 'Erreur lors du téléchargement du PDF');
    }

    return await response.blob();
  },

  /**
   * Mes factures (pour le client)
   */
  getMyInvoices: async (): Promise<InvoiceSummary[]> => {
    const response = await axios.get('/invoices/my');
    return response.data.invoices;
  },

  /**
   * Annuler une facture
   */
  cancel: async (id: number, reason: string): Promise<Invoice> => {
    const response = await axios.post(`/invoices/${id}/cancel`, { reason });
    return response.data.facture;
  },
};
