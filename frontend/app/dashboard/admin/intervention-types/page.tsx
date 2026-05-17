'use client';

import api from '@/lib/api/axios';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Wrench, ArrowLeft, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

interface InterventionType {
  id: number;
  nom: string;
  delai_moyen: number | null;
  sous_types_count: number;
}

export default function InterventionTypesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [types, setTypes] = useState<InterventionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<InterventionType | null>(null);
  const [formData, setFormData] = useState({ nom: '', delai_moyen: '' });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadTypes();
    }
  }, [user]);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/catalog/intervention-types');
      setTypes(response.data.types || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingType
        ? `/admin/catalog/intervention-types/${editingType.id}`
        : `/admin/catalog/intervention-types`;

      const payload = {
        nom: formData.nom,
        delai_moyen: formData.delai_moyen ? parseInt(formData.delai_moyen) : null,
      };

      const response = editingType
        ? await api.put(url, payload)
        : await api.post(url, payload);

      toast.success(editingType ? 'Type modifié' : 'Type créé');
      setShowModal(false);
      setFormData({ nom: '', delai_moyen: '' });
      setEditingType(null);
      loadTypes();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce type d\'intervention ?')) return;

    try {
      await api.delete(`/admin/catalog/intervention-types/${id}`);
      toast.success('Type supprimé');
      loadTypes();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <Wrench className="w-7 h-7 text-orange-500" />
            Types d'intervention
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gérez le catalogue des catégories et délais moyens des interventions.</p>
        </div>
        <Button
          onClick={() => {
            setEditingType(null);
            setFormData({ nom: '', delai_moyen: '' });
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau type
        </Button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
        </div>
      ) : types.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Aucun type d'intervention configuré</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {types.map((type) => (
            <div key={type.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{type.nom}</h3>
                <p className="text-slate-500 text-xs mt-2 font-medium">
                  Délai moyen : <span className="text-slate-700 font-bold">{type.delai_moyen ? `${type.delai_moyen} min` : 'Non défini'}</span>
                </p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100/60">
                <span className="text-slate-400 text-xs font-semibold">{type.sous_types_count} sous-types</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl"
                    onClick={() => {
                      setEditingType(type);
                      setFormData({ nom: type.nom, delai_moyen: type.delai_moyen?.toString() || '' });
                      setShowModal(true);
                    }}
                  >
                    <Edit className="w-4.5 h-4.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl"
                    onClick={() => handleDelete(type.id)}
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
              {editingType ? 'Modifier le type' : 'Ajouter un nouveau type'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom du type</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: Vidange, Suspension..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Délai moyen (minutes)</label>
                <input
                  type="number"
                  value={formData.delai_moyen}
                  onChange={(e) => setFormData({ ...formData, delai_moyen: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: 60"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm">
                  Sauvegarder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
