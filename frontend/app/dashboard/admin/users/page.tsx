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
      ADMIN: 'bg-red-50 text-red-700 border border-red-100 shadow-none font-bold rounded-full px-2.5 py-1 text-xs',
      DIRECTION: 'bg-purple-50 text-purple-700 border border-purple-100 shadow-none font-bold rounded-full px-2.5 py-1 text-xs',
      AGENT: 'bg-blue-50 text-blue-700 border border-blue-100 shadow-none font-bold rounded-full px-2.5 py-1 text-xs',
      CLIENT: 'bg-green-50 text-green-700 border border-green-100 shadow-none font-bold rounded-full px-2.5 py-1 text-xs',
    };
    return colors[role] || 'bg-slate-50 text-slate-700 border border-slate-100 shadow-none font-bold rounded-full px-2.5 py-1 text-xs';
  };

  if (authLoading || !user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <Users className="w-7 h-7 text-orange-500" />
            Gestion des utilisateurs
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gérez l'ensemble des comptes de la plateforme, attribuez des rôles et réinitialisez les accès.</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Stats Counter Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{stats.total_users}</p>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Actifs</p>
            <p className="text-xl font-extrabold text-emerald-950 mt-1">{stats.active_users}</p>
          </div>
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Inactifs</p>
            <p className="text-xl font-extrabold text-rose-950 mt-1">{stats.inactive_users}</p>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Clients</p>
            <p className="text-xl font-extrabold text-blue-950 mt-1">{stats.total_clients}</p>
          </div>
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Agents</p>
            <p className="text-xl font-extrabold text-purple-950 mt-1">{stats.total_agents}</p>
          </div>
          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Admins</p>
            <p className="text-xl font-extrabold text-orange-950 mt-1">{stats.total_admins}</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
        >
          <option value="">Tous les rôles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.nom} className="text-slate-900">
              {role.nom}
            </option>
          ))}
        </select>
        <select
          value={filterActif}
          onChange={(e) => setFilterActif(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {userItem.prenom} {userItem.nom}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">ID: #{userItem.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">
                      {userItem.telephone || <span className="text-slate-400 font-normal">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${getRoleBadgeColor(userItem.role_nom)}`}>{userItem.role_nom}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userItem.actif ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100/80 shadow-none rounded-full font-bold px-2.5 py-1 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 border border-slate-200/50 shadow-none rounded-full font-bold px-2.5 py-1 text-xs">
                          <XCircle className="w-3.5 h-3.5 mr-1 text-slate-400 inline" />
                          Inactif
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(userItem)}
                          className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(userItem);
                            setShowResetPasswordModal(true);
                          }}
                          className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        {userItem.actif && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(userItem);
                              setShowDeleteModal(true);
                            }}
                            className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl"
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
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">Créer un utilisateur</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">Ajoutez un nouvel utilisateur au système</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom *</label>
              <Input
                value={createForm.nom}
                onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })}
                placeholder="Ex: Gharbi"
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Prénom *</label>
              <Input
                value={createForm.prenom}
                onChange={(e) => setCreateForm({ ...createForm, prenom: e.target.value })}
                placeholder="Ex: Amen"
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Email *</label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="Ex: amen@gmail.com"
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Téléphone</label>
              <Input
                value={createForm.telephone}
                onChange={(e) => setCreateForm({ ...createForm, telephone: e.target.value })}
                placeholder="Ex: +216 25 985 242"
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Mot de passe *</label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Minimum 6 caractères"
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Rôle *</label>
              <select
                value={createForm.role_nom}
                onChange={(e) => setCreateForm({ ...createForm, role_nom: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none font-semibold"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.nom} className="text-slate-900">
                    {role.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold">
                Annuler
              </Button>
              <Button onClick={handleCreateUser} disabled={submitting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">Modifier l'utilisateur</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Modifiez les informations de {selectedUser?.prenom} {selectedUser?.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom</label>
              <Input
                value={editForm.nom || ''}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Prénom</label>
              <Input
                value={editForm.prenom || ''}
                onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Email</label>
              <Input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Téléphone</label>
              <Input
                value={editForm.telephone || ''}
                onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Rôle</label>
              <select
                value={editForm.role_nom || ''}
                onChange={(e) => setEditForm({ ...editForm, role_nom: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none font-semibold"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.nom} className="text-slate-900">
                    {role.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="edit-actif"
                checked={editForm.actif || false}
                onChange={(e) => setEditForm({ ...editForm, actif: e.target.checked })}
                className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="edit-actif" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Compte actif
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold">
                Annuler
              </Button>
              <Button onClick={handleUpdateUser} disabled={submitting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">Désactiver l'utilisateur</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-2 leading-relaxed">
              Êtes-vous sûr de vouloir désactiver <span className="font-bold text-slate-800">{selectedUser?.prenom} {selectedUser?.nom}</span> ?
              L'utilisateur ne pourra plus se connecter au portail SAV.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold">
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={submitting} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Désactiver'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Définissez un nouveau mot de passe pour {selectedUser?.prenom} {selectedUser?.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nouveau mot de passe</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowResetPasswordModal(false)} className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold">
                Annuler
              </Button>
              <Button onClick={handleResetPassword} disabled={submitting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Réinitialiser'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
