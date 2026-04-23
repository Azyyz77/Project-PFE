import api from './axios';

export interface PendingFile {
  id: number;
  entite_type: string;
  entite_id: number;
  entite_type_label: string;
  url: string;
  type_mime: string;
  taille_mo: number;
  date_upload: string;
  client_nom: string;
  client_email: string;
  statut_moderation: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  modere_par?: number;
  date_moderation?: string;
  commentaire_moderation?: string;
}

export interface ModerationFile extends PendingFile {
  client_telephone?: string;
  moderateur_nom?: string;
  fileExists: boolean;
  downloadUrl: string;
}

export interface ModerationStats {
  byStatus: Array<{
    statut_moderation: string;
    count: number;
    avg_size_mb: number;
    total_size_mb: number;
  }>;
  byModerator: Array<{
    moderateur_nom: string;
    files_moderated: number;
    approved: number;
    rejected: number;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  files: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Récupérer les fichiers en attente de modération
export const getPendingFiles = async (params?: {
  page?: number;
  limit?: number;
  entiteType?: 'RDV' | 'RECLAMATION';
}): Promise<PaginatedResponse<PendingFile>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.entiteType) queryParams.append('entiteType', params.entiteType);

  const url = `/moderation/pending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Approuver un fichier
export const approveFile = async (fileId: number, commentaire?: string): Promise<ApiResponse> => {
  const response = await api.post(`/moderation/${fileId}/approve`, {
    commentaire: commentaire?.trim() || null
  });
  return response.data;
};

// Rejeter un fichier
export const rejectFile = async (fileId: number, commentaire: string): Promise<ApiResponse> => {
  if (!commentaire?.trim()) {
    throw new Error('Un commentaire est requis pour le rejet');
  }
  
  const response = await api.post(`/moderation/${fileId}/reject`, {
    commentaire: commentaire.trim()
  });
  return response.data;
};

// Obtenir l'historique de modération
export const getModerationHistory = async (params?: {
  page?: number;
  limit?: number;
  status?: 'APPROUVE' | 'REJETE';
}): Promise<PaginatedResponse<PendingFile>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const url = `/moderation/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Obtenir les statistiques de modération
export const getModerationStats = async (): Promise<{ success: boolean; stats: ModerationStats }> => {
  const response = await api.get('/moderation/stats');
  return response.data;
};

// Obtenir les détails d'un fichier
export const getFileDetails = async (fileId: number): Promise<{ success: boolean; file: ModerationFile }> => {
  const response = await api.get(`/moderation/file/${fileId}`);
  return response.data;
};

// Télécharger un fichier pour modération
export const downloadFileForModeration = (fileId: number): string => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  return `${baseURL}/attachments/${fileId}/download${token ? `?token=${token}` : ''}`;
};