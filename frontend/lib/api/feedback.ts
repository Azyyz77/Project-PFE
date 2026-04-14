import api from './axios';

export interface Feedback {
  id: number;
  date_heure: string;
  feedback_note: number;
  feedback_commentaire: string | null;
  date_feedback: string;
  client_nom: string;
  agence_nom: string;
  agent_nom: string | null;
}

export interface FeedbackStats {
  total_feedbacks: number;
  note_moyenne: number;
  note_5: number;
  note_4: number;
  note_3: number;
  note_2: number;
  note_1: number;
}

export interface SubmitFeedbackData {
  rdv_id: number;
  note: number;
  commentaire?: string;
}

export const feedbackApi = {
  // Soumettre un feedback pour un rendez-vous
  submitFeedback: async (data: SubmitFeedbackData, token: string): Promise<{ message: string }> => {
    // Le wrapper axios récupère automatiquement le token, pas besoin de le passer
    const response = await api.post('/feedback', data);
    return response.data;
  },

  // Récupérer tous les feedbacks (admin/agent)
  getAllFeedbacks: async (token: string, filters?: { agence_id?: number; date_debut?: string; date_fin?: string }): Promise<Feedback[]> => {
    let url = '/feedback';
    const params = new URLSearchParams();
    
    if (filters?.agence_id) params.append('agence_id', filters.agence_id.toString());
    if (filters?.date_debut) params.append('date_debut', filters.date_debut);
    if (filters?.date_fin) params.append('date_fin', filters.date_fin);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Statistiques des feedbacks
  getFeedbackStats: async (token: string, agence_id?: number): Promise<FeedbackStats> => {
    let url = '/feedback/stats';
    if (agence_id) url += `?agence_id=${agence_id}`;
    
    const response = await api.get(url);
    return response.data;
  }
};
