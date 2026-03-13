export interface Vehicle {
  id: number;
  client_id: number;
  version_id: number;
  immatriculation: string;
  numero_chassis: string;
  couleur: string | null;
  annee: number;
  date_ajout: string;
  marque_nom?: string;
  modele_nom?: string;
  version_nom?: string;
  motorisation?: string;
  transmission?: string;
}

export interface CreateVehicleData {
  immatriculation: string;
  numero_chassis: string;
  version_id: number;
  couleur?: string;
  annee: number;
}

export interface UpdateVehicleData {
  immatriculation: string;
  numero_chassis: string;
  version_id: number;
  couleur?: string;
  annee: number;
}

export interface VersionCatalogItem {
  id: number;
  version_nom: string;
  motorisation?: string;
  transmission?: string;
  modele_id: number;
  modele_nom: string;
  marque_id: number;
  marque_nom: string;
}

export interface VehiclesResponse {
  count: number;
  vehicles: Vehicle[];
}

export interface VehicleResponse {
  vehicle: Vehicle;
}

export interface VersionCatalogResponse {
  count: number;
  versions: VersionCatalogItem[];
}
