'use client';

import api from '@/lib/api/axios';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Wrench, ArrowLeft, Loader2, Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

interface InterventionType {
  id: number;
  nom: string;
  sous_types_count: number;
}

interface SubType {
  id: number;
  nom: string;
  type_intervention_id: number;
  duree_estimee: number | null;
}

export default function SubTypesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [types, setTypes] = useState<InterventionType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [selectedType, setSelectedType] = useState<InterventionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubType, setEditingSubType] = useState<SubType | null>(null);
  const [formData, setFormData] = useState({ nom: '', duree_estimee: '', type_intervention_id: 0 });

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

  const loadSubTypes = async (typeId: number) => {
    try {
      const response = await api.get(`/admin/catalog/intervention-types/${typeId}/sub-types`);
      setSubTypes(response.data.subTypes || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des sous-types');
    }
  };

  const handleTypeClick = (type: InterventionType) => {
    setSelectedType(type);
    loadSubTypes(type.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSubType
        ? `/admin/catalog/sub-types/${editingSubType.id}`
        : `/admin/catalog/sub-types`;

      const payload = {
        nom: formData.nom,
        duree_estimee: formData.duree_estimee ? parseInt(formData.duree_estimee) : null,
        type_intervention_id: formData.type_intervention_id,
      };

      await (editingSubType ? api.put(url, payload) : api.post(url, payload));

      toast.success(editingSubType ? 'Sous-type modifié' : 'Sous-type créé');
      setShowModal(false);
      setFormData({ nom: '', duree_estimee: '', type_intervention_id: 0 });
      setEditingSubType(null);
      if (selectedType) {
        loadSubTypes(selectedType.id);
        loadTypes(); // Refresh counts
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce sous-type d\'intervention ?')) return;

    try {
      await api.delete(`/admin/catalog/sub-types/${id}`);
      toast.success('Sous-type supprimé');
      if (selectedType) {
        loadSubTypes(selectedType.id);
        loadTypes(); // Refresh counts
      }
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
      {/* Header Banner */}
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
            Sous-types d'intervention
          </h1>
          <p className="text-slate-500 text-xs mt-1">Configurez les sous-catégories et les durées estimées pour chaque type d'intervention.</p>
        </div>
      </div>

      {/* Pane Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane - Categories */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            📂 Catégories parentes
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {types.map((type) => {
                const isSelected = selectedType?.id === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => handleTypeClick(type)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10'
                        : 'bg-slate-50 border-slate-200/40 text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm leading-snug">{type.nom}</p>
                        <p className={`text-xs mt-1 font-semibold ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                          {type.sous_types_count} sous-types associés
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane - Sub-types */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedType ? `🔧 Sous-types : ${selectedType.nom}` : '🔧 Liste des sous-types'}
            </h2>
            {selectedType && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingSubType(null);
                  setFormData({ nom: '', duree_estimee: '', type_intervention_id: selectedType.id });
                  setShowModal(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-3 py-1.5 text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter
              </Button>
            )}
          </div>

          {!selectedType ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl flex flex-col justify-center items-center">
              <span className="text-3xl mb-2">👈</span>
              <p className="text-sm font-medium">Sélectionnez une catégorie parent dans le panneau de gauche</p>
            </div>
          ) : subTypes.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-slate-100 rounded-xl">
              <p className="text-sm font-medium">Aucun sous-type enregistré pour ce type.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subTypes.map((subType) => (
                <div key={subType.id} className="p-4 bg-slate-50 border border-slate-200/40 rounded-xl flex items-center justify-between hover:bg-slate-100/30 transition-colors">
                  <div>
                    <p className="text-slate-900 font-bold text-sm leading-snug">{subType.nom}</p>
                    <p className="text-slate-500 text-xs mt-1 font-medium">
                      Durée de prise en charge : <span className="text-slate-700 font-extrabold">{subType.duree_estimee ? `${subType.duree_estimee} minutes` : 'Non spécifiée'}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 rounded-xl p-2"
                      onClick={() => {
                        setEditingSubType(subType);
                        setFormData({
                          nom: subType.nom,
                          duree_estimee: subType.duree_estimee?.toString() || '',
                          type_intervention_id: subType.type_intervention_id,
                        });
                        setShowModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl p-2"
                      onClick={() => handleDelete(subType.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
              {editingSubType ? 'Modifier le sous-type' : 'Nouveau sous-type'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom du sous-type</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: Changement filtre, Purge..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Durée estimée (minutes)</label>
                <input
                  type="number"
                  value={formData.duree_estimee}
                  onChange={(e) => setFormData({ ...formData, duree_estimee: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: 45"
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
