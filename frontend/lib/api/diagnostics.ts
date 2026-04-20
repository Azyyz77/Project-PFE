import axios from './axios';

export interface DiagnosticProblem {
  id: number;
  probleme_id: number;
  description_specifique: string | null;
  gravite: string | null;
  date_ajout: string;
  probleme_nom: string;
  probleme_description: string | null;
  probleme_solution: string | null;
  probleme_categorie: string;
}

export interface Diagnostic {
  id: number;
  rdv_id: number;
  agent_id: number;
  observations_generales: string | null;
  recommandations: string | null;
  date_creation: string;
  date_modification: string | null;
  agent_nom: string;
  date_heure: string;
  rdv_statut: string;
  client_nom: string;
  immatriculation: string | null;
  marque: string | null;
  modele: string | null;
  problemes: DiagnosticProblem[];
}

export interface CreateDiagnosticData {
  rdv_id: number;
  observations_generales?: string;
  recommandations?: string;
  problemes?: {
    probleme_id: number;
    description_specifique?: string;
    gravite?: string;
  }[];
}

export const diagnosticsAPI = {
  // Obtenir tous les diagnostics
  getAll: async (filters?: { agent_id?: number; date_debut?: string; date_fin?: string }): Promise<{ count: number; diagnostics: Diagnostic[] }> => {
    const queryParams = new URLSearchParams();
    if (filters?.agent_id) queryParams.append('agent_id', filters.agent_id.toString());
    if (filters?.date_debut) queryParams.append('date_debut', filters.date_debut);
    if (filters?.date_fin) queryParams.append('date_fin', filters.date_fin);
    
    const url = `/agent/diagnostics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Obtenir un diagnostic par RDV ID
  getByRDV: async (rdvId: number): Promise<Diagnostic> => {
    const response = await axios.get(`/agent/diagnostics/rdv/${rdvId}`);
    return response.data;
  },

  // Créer un diagnostic
  create: async (data: CreateDiagnosticData): Promise<any> => {
    const response = await axios.post('/agent/diagnostics', data);
    return response.data;
  },

  // Mettre à jour un diagnostic
  update: async (id: number, data: { observations_generales?: string; recommandations?: string }): Promise<any> => {
    const response = await axios.put(`/agent/diagnostics/${id}`, data);
    return response.data;
  },

  // Ajouter un problème
  addProblem: async (diagnosticId: number, data: { probleme_id: number; description_specifique?: string; gravite?: string }): Promise<any> => {
    const response = await axios.post(`/agent/diagnostics/${diagnosticId}/problemes`, data);
    return response.data;
  },

  // Retirer un problème
  removeProblem: async (diagnosticId: number, problemeId: number): Promise<any> => {
    const response = await axios.delete(`/agent/diagnostics/${diagnosticId}/problemes/${problemeId}`);
    return response.data;
  },
};
