import axios from './axios';

export interface Attachment {
  id: number;
  entite_type: string;
  entite_id: number;
  url: string;
  type_mime: string;
  taille_mo: number;
  date_upload: string;
  isImage: boolean;
  downloadUrl: string;
  statut_moderation: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  modere_par?: number;
  date_moderation?: string;
  commentaire_moderation?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  files: Array<{
    id: number;
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    sizeInMB: number;
    uploadDate: string;
  }>;
}

export interface AttachmentsResponse {
  success: boolean;
  attachments: Attachment[];
}

export interface AttachmentStats {
  entite_type: string;
  total_files: number;
  total_size_mb: number;
  avg_size_mb: number;
}

// Upload de fichiers
export const uploadFile = async (
  files: FileList | File[], 
  entiteType: string, 
  entiteId: number,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  const formData = new FormData();
  
  // Ajouter les fichiers
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  
  // Ajouter les métadonnées
  formData.append('entiteType', entiteType);
  formData.append('entiteId', entiteId.toString());

  // Use fetch directly for file upload to handle FormData properly
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const response = await fetch(`${API_BASE_URL}/attachments/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      error: 'Erreur réseau', 
      message: `HTTP ${response.status}` 
    }));
    throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Récupérer les pièces jointes d'une entité
export const getAttachments = async (
  entiteType: string, 
  entiteId: number
): Promise<AttachmentsResponse> => {
  const response = await axios.get(`/attachments/${entiteType}/${entiteId}`);
  return response.data;
};

// Supprimer une pièce jointe
export const deleteAttachment = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`/attachments/${id}`);
  return response.data;
};

// Télécharger une pièce jointe
export const downloadAttachment = (id: number): string => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  return `${baseURL}/attachments/${id}/download${token ? `?token=${token}` : ''}`;
};

// Obtenir les statistiques des pièces jointes (admin)
export const getAttachmentStats = async (): Promise<{ success: boolean; stats: AttachmentStats[] }> => {
  const response = await axios.get('/attachments/stats/overview');
  return response.data;
};

// Utilitaires pour la validation côté client
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Taille maximum: 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Fichier trop volumineux. Taille maximum: 10MB'
    };
  }

  // Types de fichiers autorisés
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé: ${file.type}`
    };
  }

  return { valid: true };
};

// Formater la taille du fichier
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Obtenir l'icône pour un type de fichier
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.startsWith('text/')) return '📄';
  return '📎';
};