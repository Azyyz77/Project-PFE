'use client';

import { useState, useEffect } from 'react';
import { permissionsAPI, Permission, Module, Action } from '@/lib/api/permissions';

interface Role {
  id: number;
  nom: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles: Role[] = [
    { id: 1, nom: 'CLIENT' },
    { id: 2, nom: 'AGENT' },
    { id: 3, nom: 'ADMIN' },
    { id: 4, nom: 'DIRECTION' }
  ];

  // Formulaire d'ajout
  const [newPermission, setNewPermission] = useState({
    role_id: 0,
    module: '',
    action: '',
    actif: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadPermissionsByRole(selectedRole);
    } else {
      loadAllPermissions();
    }
  }, [selectedRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permsData, modulesData] = await Promise.all([
        permissionsAPI.getAll(),
        permissionsAPI.getModules()
      ]);
      
      setPermissions(permsData.permissions);
      setModules(modulesData.modules);
      setActions(modulesData.actions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadAllPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionsAPI.getAll();
      setPermissions(data.permissions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissionsByRole = async (roleId: number) => {
    try {
      setLoading(true);
      const data = await permissionsAPI.getByRole(roleId);
      setPermissions(data.permissions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPermission.role_id || !newPermission.module || !newPermission.action) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      await permissionsAPI.create(newPermission);
      setSuccess('Permission créée avec succès');
      setShowAddModal(false);
      setNewPermission({ role_id: 0, module: '', action: '', actif: true });
      
      if (selectedRole) {
        loadPermissionsByRole(selectedRole);
      } else {
        loadAllPermissions();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleTogglePermission = async (id: number, currentStatus: boolean) => {
    try {
      await permissionsAPI.update(id, !currentStatus);
      setSuccess('Permission mise à jour');
      
      if (selectedRole) {
        loadPermissionsByRole(selectedRole);
      } else {
        loadAllPermissions();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) {
      return;
    }

    try {
      await permissionsAPI.delete(id);
      setSuccess('Permission supprimée');
      
      if (selectedRole) {
        loadPermissionsByRole(selectedRole);
      } else {
        loadAllPermissions();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleInitializeDefaults = async (roleId: number) => {
    if (!confirm('Initialiser les permissions par défaut pour ce rôle ?')) {
      return;
    }

    try {
      const result = await permissionsAPI.initializeDefaults(roleId);
      setSuccess(`${result.created} permissions créées, ${result.skipped} déjà existantes`);
      
      if (selectedRole === roleId) {
        loadPermissionsByRole(roleId);
      } else {
        loadAllPermissions();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'initialisation');
    }
  };

  // Grouper les permissions par rôle et module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const key = `${perm.role_nom}-${perm.module}`;
    if (!acc[key]) {
      acc[key] = {
        role_nom: perm.role_nom,
        role_id: perm.role_id,
        module: perm.module,
        permissions: []
      };
    }
    acc[key].permissions.push(perm);
    return acc;
  }, {} as Record<string, { role_nom: string; role_id: number; module: string; permissions: Permission[] }>);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Permissions</h1>
        <p className="text-gray-600 mt-2">
          Gérez les permissions d'accès pour chaque rôle
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Filtres et actions */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filtrer par rôle:</label>
          <select
            value={selectedRole || ''}
            onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tous les rôles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            + Ajouter une permission
          </button>
        </div>
      </div>

      {/* Boutons d'initialisation */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">Initialisation rapide</h3>
        <p className="text-sm text-blue-700 mb-3">
          Créer automatiquement les permissions par défaut pour chaque rôle
        </p>
        <div className="flex flex-wrap gap-2">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => handleInitializeDefaults(role.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Initialiser {role.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des permissions */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : permissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Aucune permission trouvée</p>
          <p className="text-sm text-gray-500 mt-2">
            Utilisez les boutons d'initialisation ci-dessus pour créer les permissions par défaut
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedPermissions).map((group) => (
            <div key={`${group.role_nom}-${group.module}`} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.role_nom} - {group.module}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {group.permissions.length} permission(s)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.permissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {perm.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePermission(perm.id, perm.actif)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              perm.actif
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {perm.actif ? 'Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeletePermission(perm.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Ajouter une permission</h2>

            <form onSubmit={handleAddPermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle *
                </label>
                <select
                  value={newPermission.role_id}
                  onChange={(e) => setNewPermission({ ...newPermission, role_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module *
                </label>
                <select
                  value={newPermission.module}
                  onChange={(e) => setNewPermission({ ...newPermission, module: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Sélectionner un module</option>
                  {modules.map(module => (
                    <option key={module.code} value={module.code}>
                      {module.nom} ({module.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action *
                </label>
                <select
                  value={newPermission.action}
                  onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Sélectionner une action</option>
                  {actions.map(action => (
                    <option key={action.code} value={action.code}>
                      {action.nom} ({action.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="actif"
                  checked={newPermission.actif}
                  onChange={(e) => setNewPermission({ ...newPermission, actif: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="actif" className="ml-2 block text-sm text-gray-900">
                  Permission active
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPermission({ role_id: 0, module: '', action: '', actif: true });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
