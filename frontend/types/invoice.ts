/**
 * Types pour le système de facturation
 */

export type InvoiceStatus = 'EMISE' | 'ENVOYEE' | 'PAYEE' | 'ANNULEE';

export interface Invoice {
  id: number;
  numero: string;
  commande_id: number;
  montant_ttc: number;
  statut: InvoiceStatus;
  date_emission: string;
  date_envoi?: string;
  date_paiement?: string;
  mode_paiement?: string;
  notes?: string;
  
  // Relations
  commande_numero?: string;
  client_id?: number;
  client_nom?: string;
  client_prenom?: string;
  client_email?: string;
  client_telephone?: string;
  client_adresse?: string;
  vehicule_immatriculation?: string;
  vehicule_marque?: string;
  vehicule_modele?: string;
  agence_nom?: string;
  agence_adresse?: string;
  agence_telephone?: string;
  agence_email?: string;
  
  // Lignes de la commande
  lignes?: InvoiceLine[];
}

export interface InvoiceLine {
  id: number;
  type: 'INTERVENTION' | 'PIECE';
  description: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

export interface InvoiceSummary {
  id: number;
  numero: string;
  commande_numero: string;
  client_nom: string;
  client_prenom: string;
  montant_ttc: number;
  statut: InvoiceStatus;
  date_emission: string;
  date_paiement?: string;
}

export interface UpdateInvoiceStatusRequest {
  statut: InvoiceStatus;
  mode_paiement?: string;
  notes?: string;
}

export interface InvoiceFilters {
  statut?: InvoiceStatus;
  client_id?: number;
  agence_id?: number;
  date_debut?: string;
  date_fin?: string;
}
