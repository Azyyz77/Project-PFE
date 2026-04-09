'use client';

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
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/intervention-types`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      setTypes(result.types || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des types');
    } finally {
      setLoading(false);
    }
  };

  const loadSubTypes = async (typeId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/intervention-types/${typeId}/sub-types`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      setSubTypes(result.subTypes || []);
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
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editingSubType
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/sub-types/${editingSubType.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/sub-types`;

      const payload = {
        nom: formData.nom,
        duree_estimee: formData.duree_estimee ? parseInt(formData.duree_estimee) : null,
        type_intervention_id: formData.type_intervention_id,
      };

      const response = await fetch(url, {
        method: editingSubType ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingSubType ? 'Sous-type modifié' : 'Sous-type créé');
        setShowModal(false);
        setFormData({ nom: '', duree_estimee: '', type_intervention_id: 0 });
        setEditingSubType(null);
        if (selectedType) {
          loadSubTypes(selectedType.id);
          loadTypes(); // Refresh counts
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce sous-type ?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/sub-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Sous-type supprimé');
        if (selectedType) {
          loadSubTypes(selectedType.id);
          loadTypes(); // Refresh counts
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen admin-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="admin-page p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wrench className="w-8 h-8" />
                Gérer sous-types d'intervention
              </h1>
              <p className="text-white/70 mt-1">Gérez les sous-types par type d'intervention</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Types */}
          <div className="admin-card p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Types d'intervention</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {types.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleTypeClick(type)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedType?.id === type.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{type.nom}</p>
                        <p className="text-sm opacity-70">{type.sous_types_count} sous-types</p>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sous-types */}
          <div className="admin-card p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {selectedType ? `Sous-types - ${selectedType.nom}` : 'Sous-types'}
              </h2>
              {selectedType && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingSubType(null);
                    setFormData({ nom: '', duree_estimee: '', type_intervention_id: selectedType.id });
                    setShowModal(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              )}
            </div>
            {!selectedType ? (
              <div className="text-center py-12 text-white/50">
                Sélectionnez un type d'intervention
              </div>
            ) : (
              <div className="space-y-2">
                {subTypes.map((subType) => (
                  <div key={subType.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{subType.nom}</p>
                        <p className="text-white/60 text-sm">
                          Durée: {subType.duree_estimee ? `${subType.duree_estimee} min` : 'Non définie'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/10"
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
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(subType.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="admin-card rounded-xl p-6 w-full max-w-md border border-slate-700/70">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingSubType ? 'Modifier' : 'Nouveau'} sous-type
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Durée estimée (minutes)</label>
                  <input
                    type="number"
                    value={formData.duree_estimee}
                    onChange={(e) => setFormData({ ...formData, duree_estimee: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Ex: 30"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                    Sauvegarder
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-white hover:bg-white/10"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

