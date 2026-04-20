import axios from './axios';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AgencyStats {
  agence_id: number;
  agence_nom: string;
  ville: string;
  total_rdv: number;
  rdv_termines: number;
  rdv_annules: number;
  rdv_no_show: number;
  duree_moy_min: number;
  taux_completion: number;
  taux_annulation: number;
}

export interface GlobalStats {
  total_rdv: number;
  total_clients: number;
  total_vehicules: number;
  total_agences: number;
  rdv_termines: number;
  rdv_annules: number;
  rdv_en_attente: number;
  rdv_confirmes: number;
  duree_moyenne_min: number;
}

export interface StatutDistribution {
  statut: string;
  count: number;
  pourcentage: number;
}

export interface MonthlyEvolution {
  annee: number;
  mois: number;
  total_rdv: number;
  rdv_termines: number;
}

export interface GlobalStatsResponse {
  global: GlobalStats;
  par_statut: StatutDistribution[];
  evolution_mensuelle: MonthlyEvolution[];
}

export interface RevenueGlobal {
  total_rdv: number;
  revenu_total: number;
  revenu_moyen: number;
  revenu_min: number;
  revenu_max: number;
}

export interface RevenueByAgency {
  agence_id: number;
  agence_nom: string;
  total_rdv: number;
  revenu_total: number;
  revenu_moyen: number;
}

export interface RevenueByType {
  intervention: string;
  nombre_rdv: number;
  revenu_total: number;
  prix_moyen: number;
}

export interface MonthlyRevenue {
  annee: number;
  mois: number;
  total_rdv: number;
  revenu_total: number;
}

export interface RevenueStatsResponse {
  global: RevenueGlobal;
  par_agence: RevenueByAgency[];
  par_type_intervention: RevenueByType[];
  evolution_mensuelle: MonthlyRevenue[];
}

export interface SatisfactionGlobal {
  total_feedbacks: number;
  note_moyenne: number;
  feedbacks_positifs: number;
  feedbacks_neutres: number;
  feedbacks_negatifs: number;
  taux_satisfaction: number;
}

export interface SatisfactionByAgency {
  agence_id: number;
  agence_nom: string;
  total_feedbacks: number;
  note_moyenne: number;
  feedbacks_positifs: number;
}

export interface NoteDistribution {
  note: number;
  count: number;
  pourcentage: number;
}

export interface ComplaintsStats {
  total_reclamations: number;
  reclamations_resolues: number;
  reclamations_en_cours: number;
  reclamations_nouvelles: number;
  delai_moyen_resolution_jours: number;
}

export interface SatisfactionStatsResponse {
  satisfaction: SatisfactionGlobal;
  par_agence: SatisfactionByAgency[];
  distribution_notes: NoteDistribution[];
  reclamations: ComplaintsStats;
}

export interface AgentPerformance {
  agent_id: number;
  agent_nom: string;
  agence_nom: string;
  total_rdv: number;
  rdv_termines: number;
  duree_moyenne_min: number;
  note_moyenne: number;
  total_feedbacks: number;
}

export interface TopAgent {
  agent_id: number;
  agent_nom: string;
  agence_nom: string;
  note_moyenne: number;
  total_feedbacks: number;
}

export interface AgentWorkload {
  agent_id: number;
  agent_nom: string;
  total_rdv: number;
  total_minutes_travail: number;
  duree_moyenne_min: number;
}

export interface PerformanceStatsResponse {
  performance_agents: AgentPerformance[];
  top_agents: TopAgent[];
  charge_travail: AgentWorkload[];
}

export interface StatsFilters {
  dateDebut?: string;
  dateFin?: string;
  agenceId?: number;
}

export interface ExportOptions {
  format?: 'json' | 'csv' | 'excel';
  type: 'agencies' | 'global' | 'revenue' | 'satisfaction' | 'performance';
  dateDebut?: string;
  dateFin?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

const BASE_URL = '/direction/stats';

/**
 * Obtenir les statistiques par agence
 */
export const getAgencyStats = async (): Promise<AgencyStats[]> => {
  const response = await axios.get(`${BASE_URL}/agencies`);
  return response.data.data;
};

/**
 * Obtenir les statistiques globales
 */
export const getGlobalStats = async (filters?: StatsFilters): Promise<GlobalStatsResponse> => {
  const params = new URLSearchParams();
  if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters?.dateFin) params.append('dateFin', filters.dateFin);

  const response = await axios.get(`${BASE_URL}/global?${params.toString()}`);
  return response.data.data;
};

/**
 * Obtenir les statistiques de revenus
 */
export const getRevenueStats = async (filters?: StatsFilters): Promise<RevenueStatsResponse> => {
  const params = new URLSearchParams();
  if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters?.dateFin) params.append('dateFin', filters.dateFin);
  if (filters?.agenceId) params.append('agenceId', filters.agenceId.toString());

  const response = await axios.get(`${BASE_URL}/revenue?${params.toString()}`);
  return response.data.data;
};

/**
 * Obtenir les statistiques de satisfaction client
 */
export const getSatisfactionStats = async (filters?: StatsFilters): Promise<SatisfactionStatsResponse> => {
  const params = new URLSearchParams();
  if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters?.dateFin) params.append('dateFin', filters.dateFin);
  if (filters?.agenceId) params.append('agenceId', filters.agenceId.toString());

  const response = await axios.get(`${BASE_URL}/satisfaction?${params.toString()}`);
  return response.data.data;
};

/**
 * Obtenir les statistiques de performance des agents
 */
export const getPerformanceStats = async (filters?: StatsFilters): Promise<PerformanceStatsResponse> => {
  const params = new URLSearchParams();
  if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters?.dateFin) params.append('dateFin', filters.dateFin);
  if (filters?.agenceId) params.append('agenceId', filters.agenceId.toString());

  const response = await axios.get(`${BASE_URL}/performance?${params.toString()}`);
  return response.data.data;
};

/**
 * Exporter les statistiques
 */
export const exportStats = async (options: ExportOptions): Promise<any> => {
  const params = new URLSearchParams();
  params.append('format', options.format || 'json');
  params.append('type', options.type);
  if (options.dateDebut) params.append('dateDebut', options.dateDebut);
  if (options.dateFin) params.append('dateFin', options.dateFin);

  const response = await axios.get(`${BASE_URL}/export?${params.toString()}`);
  
  return response.data;
};

// Export par défaut
const directionStatsAPI = {
  getAgencyStats,
  getGlobalStats,
  getRevenueStats,
  getSatisfactionStats,
  getPerformanceStats,
  exportStats
};

export default directionStatsAPI;
