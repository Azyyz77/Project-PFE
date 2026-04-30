/**
 * Types pour les promotions véhicules et messages d'accueil
 */

export interface VehiclePromotion {
  id: number;
  titre: string;
  description?: string;
  marque_id?: number;
  modele_id?: number;
  version_id?: number;
  prix_original?: number;
  prix_promotion: number;
  pourcentage_reduction?: number;
  image_url?: string;
  date_debut: string;
  date_fin: string;
  actif: boolean;
  stock_disponible?: number;
  conditions?: string;
  agence_id?: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  // Données jointes
  marque_nom?: string;
  marque_logo?: string;
  modele_nom?: string;
  version_nom?: string;
  agence_nom?: string;
  agence_adresse?: string;
  agence_telephone?: string;
  created_by_nom?: string;
  created_by_prenom?: string;
}

export interface CreateVehiclePromotionDto {
  titre: string;
  description?: string;
  marque_id?: number;
  modele_id?: number;
  version_id?: number;
  prix_original?: number;
  prix_promotion: number;
  pourcentage_reduction?: number;
  image_url?: string;
  date_debut: string;
  date_fin: string;
  stock_disponible?: number;
  conditions?: string;
  agence_id?: number;
}

export interface UpdateVehiclePromotionDto extends Partial<CreateVehiclePromotionDto> {
  actif?: boolean;
}

export type MessageType = 'INFO' | 'ALERTE' | 'PROMOTION' | 'MAINTENANCE' | 'URGENT';

export interface WelcomeMessage {
  id: number;
  titre: string;
  contenu: string;
  type: MessageType;
  priorite: number; // 1=Basse, 2=Normale, 3=Haute, 4=Urgente
  date_debut: string;
  date_fin?: string;
  actif: boolean;
  afficher_accueil: boolean;
  afficher_dashboard: boolean;
  couleur_fond?: string;
  icone?: string;
  lien_url?: string;
  lien_texte?: string;
  agence_id?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  // Données jointes
  agence_nom?: string;
  created_by_nom?: string;
  created_by_prenom?: string;
  nb_lectures?: number;
  lu?: boolean; // Pour l'utilisateur connecté
}

export interface CreateWelcomeMessageDto {
  titre: string;
  contenu: string;
  type?: MessageType;
  priorite?: number;
  date_debut: string;
  date_fin?: string;
  afficher_accueil?: boolean;
  afficher_dashboard?: boolean;
  couleur_fond?: string;
  icone?: string;
  lien_url?: string;
  lien_texte?: string;
  agence_id?: number;
}

export interface UpdateWelcomeMessageDto extends Partial<CreateWelcomeMessageDto> {
  actif?: boolean;
}
