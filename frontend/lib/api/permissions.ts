import axios from './axios';

export interface Permission {
  id: number;
  role_id: number;
  role_nom: string;
  module: string;
  action: string;
  actif: boolean;
}

export interface Module {
  code: string;
  nom: string;
}

export interface Action {
  code: string;
  nom: string;
}

export interface ModulesAndActions {
  modules: Module[];
  actions: Action[];
}

export const permissionsAPI = {
  // Obtenir toutes les permissions
  getAll: async (): Promise<{ count: number; permissions: Permission[] }> => {
    const response = await axios.get('/admin/permissions');
    return response.data;
  },

  // Obtenir les permissions par rôle
  getByRole: async (roleId: number): Promise<{ count: number; permissions: Permission[] }> => {
    const response = await axios.get(`/admin/permissions/role/${roleId}`);
    return response.data;
  },

  // Obtenir les modules et actions disponibles
  getModules: async (): Promise<ModulesAndActions> => {
    const response = await axios.get('/admin/permissions/modules');
    return response.data;
  },

  // Vérifier une permission
  check: async (userId: number, module: string, action: string): Promise<{ hasPermission: boolean }> => {
    const response = await axios.get('/admin/permissions/check', {
      params: { userId, module, action }
    });
    return response.data;
  },

  // Créer une permission
  create: async (data: { role_id: number; module: string; action: string; actif?: boolean }): Promise<any> => {
    const response = await axios.post('/admin/permissions', data);
    return response.data;
  },

  // Mettre à jour une permission (activer/désactiver)
  update: async (id: number, actif: boolean): Promise<any> => {
    const response = await axios.put(`/admin/permissions/${id}`, { actif });
    return response.data;
  },

  // Supprimer une permission
  delete: async (id: number): Promise<any> => {
    const response = await axios.delete(`/admin/permissions/${id}`);
    return response.data;
  },

  // Initialiser les permissions par défaut pour un rôle
  initializeDefaults: async (roleId: number): Promise<any> => {
    const response = await axios.post(`/admin/permissions/role/${roleId}/initialize`);
    return response.data;
  },
};
