/**
 * Types pour les commandes de réparation
 */

export type RepairOrderStatus = 
  | 'BROUILLON'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'FACTUREE'
  | 'ANNULEE';

export type LineType = 'INTERVENTION' | 'PIECE';

export interface RepairOrderLine {
  id: number;
  type: LineType;
  intervention_id?: number;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

export interface RepairOrder {
  id: number;
  numero: string;
  rdv_id: number;
  client_id: number;
  vehicule_id: number;
  agence_id: number;
  statut: RepairOrderStatus;
  montant_total: number;
  date_creation: string;
  date_validation?: string;
  date_fin?: string;
  
  // Relations
  client_nom: string;
  client_prenom: string;
  client_telephone?: string;
  client_email?: string;
  immatriculation: string;
  numero_chassis: string;
  modele_nom: string;
  marque_nom: string;
  agence_nom: string;
  agence_adresse?: string;
  agence_telephone?: string;
  
  // Lignes
  lignes: RepairOrderLine[];
}

export interface RepairOrderSummary {
  id: number;
  numero: string;
  statut: RepairOrderStatus;
  montant_total: number;
  date_creation: string;
  date_fin?: string;
  client_nom: string;
  client_prenom: string;
  immatriculation: string;
  modele_nom: string;
  marque_nom: string;
  agence_nom: string;
}

export interface Invoice {
  id: number;
  numero: string;
  commande_id: number;
  client_id: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  statut: 'EMISE' | 'PAYEE' | 'ANNULEE';
  mode_paiement?: string;
  date_emission: string;
  date_echeance?: string;
  date_paiement?: string;
  notes?: string;
  
  // Relations
  client_nom: string;
  client_prenom: string;
  client_email?: string;
  client_telephone?: string;
}

export interface CreateLineRequest {
  type: LineType;
  intervention_id?: number;
  quantite: number;
  prix_unitaire: number;
}

export interface UpdateStatusRequest {
  statut: RepairOrderStatus;
}
