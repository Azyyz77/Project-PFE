'use client';

import api from '@/lib/api/axios';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Car, ArrowLeft, Loader2, Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

interface Brand {
  id: number;
  nom: string;
  modeles_count: number;
}

interface Model {
  id: number;
  nom: string;
  marque_id: number;
  versions_count: number;
}

export default function BrandsModelsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [brandForm, setBrandForm] = useState({ nom: '' });
  const [modelForm, setModelForm] = useState({ nom: '', marque_id: 0 });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBrands();
    }
  }, [user]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/catalog/brands');
      setBrands(response.data.brands || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (brandId: number) => {
    try {
      const response = await api.get(`/admin/catalog/brands/${brandId}/models`);
      setModels(response.data.models || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des modèles');
    }
  };

  const handleBrandClick = (brand: Brand) => {
    setSelectedBrand(brand);
    loadModels(brand.id);
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBrand 
        ? `/admin/catalog/brands/${editingBrand.id}`
        : `/admin/catalog/brands`;
      
      if (editingBrand) {
        await api.put(url, brandForm);
      } else {
        await api.post(url, brandForm);
      }
      
      toast.success(editingBrand ? 'Marque modifiée' : 'Marque créée');
      setShowBrandModal(false);
      setBrandForm({ nom: '' });
      setEditingBrand(null);
      loadBrands();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingModel
        ? `/admin/catalog/models/${editingModel.id}`
        : `/admin/catalog/models`;
      
      const payload = {
        nom: modelForm.nom,
        marque_id: modelForm.marque_id
      };
      
      if (editingModel) {
        await api.put(url, payload);
      } else {
        await api.post(url, payload);
      }
      
      toast.success(editingModel ? 'Modèle modifié' : 'Modèle créé');
      setShowModelModal(false);
      setModelForm({ nom: '', marque_id: 0 });
      setEditingModel(null);
      if (selectedBrand) {
        loadModels(selectedBrand.id);
        loadBrands();
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du modèle');
    }
  };

  const handleBrandDelete = async (id: number) => {
    if (!confirm('Supprimer cette marque et tous les modèles associés ?')) return;
    try {
      await api.delete(`/admin/catalog/brands/${id}`);
      toast.success('Marque supprimée');
      setSelectedBrand(null);
      setModels([]);
      loadBrands();
    } catch (error) {
      toast.error('Erreur lors de la suppression de la marque');
    }
  };

  const handleModelDelete = async (id: number) => {
    if (!confirm('Supprimer ce modèle ?')) return;
    try {
      await api.delete(`/admin/catalog/models/${id}`);
      toast.success('Modèle supprimé');
      if (selectedBrand) {
        loadModels(selectedBrand.id);
        loadBrands();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du modèle');
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
            <Car className="w-7 h-7 text-orange-500" />
            Marques et modèles
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gérez le catalogue des marques de voitures et leurs modèles associés.</p>
        </div>
        <Button
          onClick={() => {
            setEditingBrand(null);
            setBrandForm({ nom: '' });
            setShowBrandModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle marque
        </Button>
      </div>

      {/* Pane Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane - Brands */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            🏷️ Catalogue des marques
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {brands.map((brand) => {
                const isSelected = selectedBrand?.id === brand.id;
                return (
                  <div
                    key={brand.id}
                    onClick={() => handleBrandClick(brand)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10'
                        : 'bg-slate-50 border-slate-200/40 text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm leading-snug">{brand.nom}</p>
                        <p className={`text-xs mt-1 font-semibold ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                          {brand.modeles_count} modèles répertoriés
                        </p>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`rounded-xl p-2 ${isSelected ? 'text-white hover:bg-orange-600' : 'text-slate-400 hover:bg-slate-200'}`}
                          onClick={() => {
                            setEditingBrand(brand);
                            setBrandForm({ nom: brand.nom });
                            setShowBrandModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`rounded-xl p-2 ${isSelected ? 'text-orange-100 hover:bg-orange-600 hover:text-white' : 'text-rose-500 hover:bg-rose-50'}`}
                          onClick={() => handleBrandDelete(brand.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane - Models */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedBrand ? `🚗 Modèles : ${selectedBrand.nom}` : '🚗 Modèles de véhicules'}
            </h2>
            {selectedBrand && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingModel(null);
                  setModelForm({ nom: '', marque_id: selectedBrand.id });
                  setShowModelModal(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-3 py-1.5 text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter
              </Button>
            )}
          </div>

          {!selectedBrand ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl flex flex-col justify-center items-center">
              <span className="text-3xl mb-2">👈</span>
              <p className="text-sm font-medium">Sélectionnez une marque dans le panneau de gauche</p>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-slate-100 rounded-xl">
              <p className="text-sm font-medium">Aucun modèle enregistré pour cette marque.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {models.map((model) => (
                <div key={model.id} className="p-4 bg-slate-50 border border-slate-200/40 rounded-xl flex items-center justify-between hover:bg-slate-100/30 transition-colors">
                  <div>
                    <p className="text-slate-900 font-bold text-sm leading-snug">{model.nom}</p>
                    <p className="text-slate-500 text-xs mt-1 font-semibold">
                      Versions : <span className="text-slate-700">{model.versions_count}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 rounded-xl p-2"
                      onClick={() => {
                        setEditingModel(model);
                        setModelForm({
                          nom: model.nom,
                          marque_id: model.marque_id
                        });
                        setShowModelModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl p-2"
                      onClick={() => handleModelDelete(model.id)}
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

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
              {editingBrand ? 'Modifier la marque' : 'Nouvelle marque'}
            </h2>
            <form onSubmit={handleBrandSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom de la marque</label>
                <input
                  type="text"
                  value={brandForm.nom}
                  onChange={(e) => setBrandForm({ nom: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: Chery, Omoda..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
                  onClick={() => setShowBrandModal(false)}
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

      {/* Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
              {editingModel ? 'Modifier le modèle' : 'Nouveau modèle'}
            </h2>
            <form onSubmit={handleModelSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom du modèle</label>
                <input
                  type="text"
                  value={modelForm.nom}
                  onChange={(e) => setModelForm({ ...modelForm, nom: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: Tiggo 7 Pro, Arrizo..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
                  onClick={() => setShowModelModal(false)}
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
