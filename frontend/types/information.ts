// ============================================================================
// TYPES POUR LE SYSTÈME D'INFORMATION
// ============================================================================

export interface Section {
  id: number;
  titre: string;
  slug: string;
  icone?: string;
  ordre: number;
  actif: boolean;
  date_creation: string;
  date_modification?: string;
  nombre_contenus?: number;
  nombre_documents?: number;
}

export interface Content {
  id: number;
  section_id: number;
  titre: string;
  contenu: string; // HTML content
  ordre: number;
  actif: boolean;
  date_creation: string;
  date_modification?: string;
  section_titre?: string; // For admin view
}

export interface Document {
  id: number;
  section_id?: number;
  titre: string;
  description?: string;
  nom_fichier: string;
  chemin_fichier: string;
  type_fichier?: string;
  taille_octets?: number;
  nombre_telechargements: number;
  actif: boolean;
  date_creation: string;
  date_modification?: string;
  section_titre?: string; // For admin view
}

export interface SectionWithContent {
  section: Section;
  contents: Content[];
  documents: Document[];
}

// Form types for admin
export interface SectionFormData {
  titre: string;
  slug: string;
  icone?: string;
  ordre: number;
  actif: boolean;
}

export interface ContentFormData {
  section_id: number;
  titre: string;
  contenu: string;
  ordre: number;
  actif: boolean;
}

export interface DocumentFormData {
  section_id?: number;
  titre: string;
  description?: string;
  nom_fichier: string;
  chemin_fichier: string;
  type_fichier?: string;
  taille_octets?: number;
  actif: boolean;
}
