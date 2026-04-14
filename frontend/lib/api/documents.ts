import api from './axios';

export interface Document {
  id: number;
  titre: string;
  description?: string;
  url: string;
  categorie: string;
  type_mime?: string;
  taille_mo?: number;
  admin_id: number;
  actif: boolean;
  date_creation: string;
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

  // Mettre à jour un document (admin)
  updateDocument: async (id: number, data: Partial<Document>): Promise<{ message: string }> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  // Supprimer un document (admin)
  deleteDocument: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
