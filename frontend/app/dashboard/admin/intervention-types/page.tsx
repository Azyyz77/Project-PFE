'use client';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editingType
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/intervention-types/${editingType.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/intervention-types`;

      const payload = {
        nom: formData.nom,
        delai_moyen: formData.delai_moyen ? parseInt(formData.delai_moyen) : null,
      };

      const response = await fetch(url, {
        method: editingType ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingType ? 'Type modifié' : 'Type créé');
        setShowModal(false);
        setFormData({ nom: '', delai_moyen: '' });
        setEditingType(null);
        loadTypes();
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce type d\'intervention ?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/intervention-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Type supprimé');
        loadTypes();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 p-6">
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
                Gérer types d'intervention
              </h1>
              <p className="text-white/70 mt-1">Gérez les types d'interventions disponibles</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingType(null);
              setFormData({ nom: '', delai_moyen: '' });
              setShowModal(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau type
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((type) => (
              <div key={type.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-2">{type.nom}</h3>
                <p className="text-white/70 text-sm mb-4">
                  Délai moyen: {type.delai_moyen ? `${type.delai_moyen} min` : 'Non défini'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">{type.sous_types_count} sous-types</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/10"
                      onClick={() => {
                        setEditingType(type);
                        setFormData({ nom: type.nom, delai_moyen: type.delai_moyen?.toString() || '' });
                        setShowModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDelete(type.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-red-900 to-red-950 rounded-xl p-6 w-full max-w-md border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingType ? 'Modifier' : 'Nouveau'} type
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
                  <label className="block text-white/70 text-sm mb-2">Délai moyen (minutes)</label>
                  <input
                    type="number"
                    value={formData.delai_moyen}
                    onChange={(e) => setFormData({ ...formData, delai_moyen: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Ex: 60"
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
