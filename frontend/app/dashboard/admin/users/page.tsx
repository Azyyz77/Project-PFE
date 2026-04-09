'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getAllUsers,
  getUserStats,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  AdminUser,
  UserStats,
  Role,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/lib/api/adminUsers';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterActif, setFilterActif] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    role_nom: 'CLIENT',
  });
  const [editForm, setEditForm] = useState<UpdateUserPayload>({});
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !['ADMIN', 'DIRECTION'].includes(user.role))) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, filterRole, filterActif, searchTerm]);

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [usersData, statsData, rolesData] = await Promise.all([
        getAllUsers(token, {
          role: filterRole || undefined,
          actif: filterActif ? filterActif === 'true' : undefined,
          search: searchTerm || undefined,
        }),
        getUserStats(token),
        getRoles(token),
      ]);

      setUsers(usersData);
      setStats(statsData);
      setRoles(rolesData);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!token) return;

    if (!createForm.nom || !createForm.prenom || !createForm.email || !createForm.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      await createUser(token, createForm);
      toast.success('Utilisateur créé avec succès');
      setShowCreateModal(false);
      setCreateForm({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        role_nom: 'CLIENT',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!token || !selectedUser) return;

    try {
      setSubmitting(true);
      await updateUser(token, selectedUser.id, editForm);
      toast.success('Utilisateur mis à jour avec succès');
      setShowEditModal(false);
      setSelectedUser(null);
      setEditForm({});
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !selectedUser) return;

    try {
      setSubmitting(true);
      await deleteUser(token, selectedUser.id);
      toast.success('Utilisateur désactivé avec succès');
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la désactivation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token || !selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setSubmitting(true);
      await resetUserPassword(token, selectedUser.id, newPassword);
      toast.success('Mot de passe réinitialisé avec succès');
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la réinitialisation');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || '',
      role_nom: user.role_nom,
      actif: user.actif,
    });
    setShowEditModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800',
      DIRECTION: 'bg-purple-100 text-purple-800',
      AGENT: 'bg-blue-100 text-blue-800',
      CLIENT: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || !user || !token) {
    return (
      <div className="min-h-screen admin-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="admin-page p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="w-8 h-8" />
                Gestion des utilisateurs
              </h1>
              <p className="text-white/70 mt-1">Gérez les comptes et les rôles</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="admin-card p-4 border border-white/20">
              <p className="text-white/70 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total_users}</p>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <p className="text-green-100 text-sm">Actifs</p>
              <p className="text-2xl font-bold text-green-50">{stats.active_users}</p>
            </div>
            <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-red-100 text-sm">Inactifs</p>
              <p className="text-2xl font-bold text-red-50">{stats.inactive_users}</p>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
              <p className="text-blue-100 text-sm">Clients</p>
              <p className="text-2xl font-bold text-blue-50">{stats.total_clients}</p>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <p className="text-purple-100 text-sm">Agents</p>
              <p className="text-2xl font-bold text-purple-50">{stats.total_agents}</p>
            </div>
            <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
              <p className="text-orange-100 text-sm">Admins</p>
              <p className="text-2xl font-bold text-orange-50">{stats.total_admins}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="admin-card p-4 mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Tous les rôles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.nom}>
                  {role.nom}
                </option>
              ))}
            </select>
            <select
              value={filterActif}
              onChange={(e) => setFilterActif(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-card border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-xs text-white/50">ID: {user.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {user.telephone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleBadgeColor(user.role_nom)}>{user.role_nom}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.actif ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(user)}
                            className="text-white hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowResetPasswordModal(true);
                            }}
                            className="text-white hover:bg-white/10"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          {user.actif && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un utilisateur</DialogTitle>
              <DialogDescription>Ajoutez un nouvel utilisateur au système</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={createForm.nom}
                  onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prénom *</label>
                <Input
                  value={createForm.prenom}
                  onChange={(e) => setCreateForm({ ...createForm, prenom: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  value={createForm.telephone}
                  onChange={(e) => setCreateForm({ ...createForm, telephone: e.target.value })}
                  placeholder="+216 XX XXX XXX"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mot de passe *</label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rôle *</label>
                <select
                  value={createForm.role_nom}
                  onChange={(e) => setCreateForm({ ...createForm, role_nom: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.nom}>
                      {role.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateUser} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de {selectedUser?.prenom} {selectedUser?.nom}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={editForm.nom || ''}
                  onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  value={editForm.prenom || ''}
                  onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  value={editForm.telephone || ''}
                  onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rôle</label>
                <select
                  value={editForm.role_nom || ''}
                  onChange={(e) => setEditForm({ ...editForm, role_nom: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.nom}>
                      {role.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.actif || false}
                  onChange={(e) => setEditForm({ ...editForm, actif: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Compte actif</label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateUser} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete User Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Désactiver l'utilisateur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir désactiver {selectedUser?.prenom} {selectedUser?.nom} ?
                L'utilisateur ne pourra plus se connecter.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Désactiver'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Password Modal */}
        <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
              <DialogDescription>
                Définissez un nouveau mot de passe pour {selectedUser?.prenom} {selectedUser?.nom}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nouveau mot de passe</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowResetPasswordModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleResetPassword} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Réinitialiser'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

