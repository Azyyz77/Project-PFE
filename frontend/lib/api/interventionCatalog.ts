/**
 * API pour la gestion du catalogue d'interventions
 */

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function headers(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Types
export interface InterventionType {
  id: number;
  nom: string;
  delai_moyen: number;
  nombre_sous_types: number;
}

export interface SubType {
  id: number;
  nom: string;
  duree_estimee: number;
  type_intervention_id: number;
  type_nom: string;
}

export interface Package {
  id: number;
  nom: string;
  description: string;
  prix: number;
  duree_estimee: string;
  actif: boolean;
  nombre_interventions: number;
}

export interface PackageDetails {
  package: {
    id: number;
    nom: string;
    description: string;
    prix: number;
    duree_estimee: string;
    actif: boolean;
  };
  interventions: Array<{
    id: number;
    nom: string;
    duree_estimee: number;
    type_nom: string;
  }>;
}

export interface CatalogStats {
  total_types: number;
  total_sous_types: number;
  total_packages_actifs: number;
  total_packages: number;
  duree_moyenne: number;
}

// API Functions
export async function getInterventionTypes(token: string): Promise<InterventionType[]> {
  const r = await axios.get(`${API_BASE}/api/catalog/types`, {
    headers: headers(token)
  });
  return r.data.types;
}

export async function getSubTypes(token: string): Promise<SubType[]> {
  const r = await axios.get(`${API_BASE}/api/catalog/subtypes`, {
    headers: headers(token)
  });
  return r.data.subTypes;
}

export async function getPackages(token: string): Promise<Package[]> {
  const r = await axios.get(`${API_BASE}/api/catalog/packages`, {
    headers: headers(token)
  });
  return r.data.packages;
}

export async function getPackageDetails(token: string, packageId: number): Promise<PackageDetails> {
  const r = await axios.get(`${API_BASE}/api/catalog/packages/${packageId}`, {
    headers: headers(token)
  });
  return r.data;
}

export async function getCatalogStats(token: string): Promise<CatalogStats> {
  const r = await axios.get(`${API_BASE}/api/catalog/stats`, {
    headers: headers(token)
  });
  return r.data.stats;
}
