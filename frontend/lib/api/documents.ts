import api from './axios';

export interface Document {
  id: number;
  titre: string;
  description?: string;
  url: string;
  download_url?: string;
  categorie: string;
  type_mime?: string;
  taille_mo?: number;
  admin_id: number;
  actif: boolean;
  date_creation: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_ORIGIN = API_BASE_URL.replace(/\/?api\/?$/, '');

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const appendToken = (url: string) => {
  const token = getAuthToken();
  if (!token) return url;
  if (url.includes('token=')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${token}`;
};

const buildAbsoluteUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
};

export const getDocumentDownloadUrl = (doc: Document): string => {
  const rawUrl = doc.download_url || doc.url;
  if (!rawUrl) return '';
  const absolute = buildAbsoluteUrl(rawUrl);
  if (absolute.startsWith(`${API_ORIGIN}/api/`)) {
    return appendToken(absolute);
  }
  return absolute;
};

export interface DocumentUpdateInput {
  titre?: string;
  description?: string | null;
  categorie?: string;
  actif?: boolean;
  file?: File;
}

export const documentsApi = {
  // Récupérer tous les documents
  getAllDocuments: async (): Promise<Document[]> => {
    const response = await api.get('/documents');
    return response.data;
  },

  // Récupérer les documents par catégorie
  getDocumentsByCategory: async (categorie: string): Promise<Document[]> => {
    const response = await api.get(`/documents/category/${categorie}`);
    return response.data;
  },

  // Créer un document (admin)
  createDocument: async (data: Partial<Document>): Promise<{ message: string; id: number }> => {
    const response = await api.post('/documents', data);
    return response.data;
  },

  // Uploader un document (admin)
  uploadDocument: async (data: {
    file: File;
    titre?: string;
    description?: string;
    categorie: string;
  }): Promise<{ message: string; id: number; download_url?: string }> => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.titre) formData.append('titre', data.titre);
    if (data.description) formData.append('description', data.description);
    formData.append('categorie', data.categorie);

    const response = await api.post('/documents/upload', formData);
    return response.data;
  },

  // Mettre à jour un document (admin)
  updateDocument: async (id: number, data: DocumentUpdateInput): Promise<{ message: string }> => {
    if (data.file) {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.titre !== undefined) formData.append('titre', data.titre);
      if (data.description !== undefined) formData.append('description', data.description ?? '');
      if (data.categorie !== undefined) formData.append('categorie', data.categorie);
      if (data.actif !== undefined) formData.append('actif', String(data.actif));

      const response = await api.put(`/documents/${id}`, formData);
      return response.data;
    }

    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  // Supprimer un document (admin)
  deleteDocument: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
