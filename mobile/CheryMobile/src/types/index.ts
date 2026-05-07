export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'client' | 'agent' | 'admin';
}

export interface Invoice {
  id: number;
  numero: string;
  statut_paiement: 'EMISE' | 'ENVOYEE' | 'PAYEE' | 'ANNULEE';
  montant_ttc: number;
  date_emission: string;
  date_echeance?: string;
  date_paiement?: string;
  commande_numero?: string;
  vehicule_immatriculation?: string;
  agence_nom?: string;
}

export interface InvoiceDetail extends Invoice {
  montant_ht: number;
  montant_tva: number;
  taux_tva: number;
  mode_paiement?: string;
  client_nom?: string;
  client_prenom?: string;
  vehicule_marque?: string;
  vehicule_modele?: string;
  lignes?: InvoiceLine[];
}

export interface InvoiceLine {
  id: number;
  description: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
}
