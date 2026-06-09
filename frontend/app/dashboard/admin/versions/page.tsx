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

interface Version {
  id: number;
  nom: string;
  modele_id: number;
  motorisation?: string | null;
  transmission?: string | null;
  actif: boolean;
}

type VersionForm = {
  nom: string;
  code: string;
};

export default function VersionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [formData, setFormData] = useState<VersionForm>({ nom: '', code: '' });

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
      toast.error('Erreur lors du chargement des marques');
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

  const loadVersions = async (modelId: number) => {
    try {
      const response = await api.get(`/admin/catalog/models/${modelId}/versions`);
      setVersions(response.data.versions || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des versions');
    }
  };

  const handleBrandClick = (brand: Brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setVersions([]);
    loadModels(brand.id);
  };

  const handleModelClick = (model: Model) => {
    setSelectedModel(model);
    loadVersions(model.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModel) {
      toast.error('Veuillez selectionner un modele');
      return;
    }

    try {
      const url = editingVersion
        ? `/admin/catalog/versions/${editingVersion.id}`
        : `/admin/catalog/versions`;

      const payload = {
        nom: formData.nom,
        modele_id: selectedModel.id,
        motorisation: formData.code || null,
      };

      await (editingVersion ? api.put(url, payload) : api.post(url, payload));

      toast.success(editingVersion ? 'Version modifiee' : 'Version creee');
      setShowModal(false);
      setFormData({ nom: '', code: '' });
      setEditingVersion(null);
      loadVersions(selectedModel.id);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erreur lors de la sauvegarde';
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette version ?')) return;

    try {
      await api.delete(`/admin/catalog/versions/${id}`);
      toast.success('Version supprimee');
      if (selectedModel) {
        loadVersions(selectedModel.id);
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erreur lors de la suppression';
      toast.error(message);
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
            Versions (modeles)
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gerez les versions associees a chaque modele.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            🏷️ Marques
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
                          {brand.modeles_count} modeles
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

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            🚗 Modeles
          </h2>
          {!selectedBrand ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl flex flex-col justify-center items-center">
              <span className="text-3xl mb-2">👈</span>
              <p className="text-sm font-medium">Selectionnez une marque</p>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-slate-100 rounded-xl">
              <p className="text-sm font-medium">Aucun modele pour cette marque.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {models.map((model) => {
                const isSelected = selectedModel?.id === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => handleModelClick(model)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10'
                        : 'bg-slate-50 border-slate-200/40 text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm leading-snug">{model.nom}</p>
                        <p className={`text-xs mt-1 font-semibold ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                          {model.versions_count} versions
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

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedModel ? `🧩 Versions : ${selectedModel.nom}` : '🧩 Liste des versions'}
            </h2>
            {selectedModel && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingVersion(null);
                  setFormData({ nom: '', code: '' });
                  setShowModal(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-3 py-1.5 text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter
              </Button>
            )}
          </div>

          {!selectedModel ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl flex flex-col justify-center items-center">
              <span className="text-3xl mb-2">👈</span>
              <p className="text-sm font-medium">Selectionnez un modele</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-slate-100 rounded-xl">
              <p className="text-sm font-medium">Aucune version pour ce modele.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="p-4 bg-slate-50 border border-slate-200/40 rounded-xl flex items-center justify-between hover:bg-slate-100/30 transition-colors">
                  <div>
                    <p className="text-slate-900 font-bold text-sm leading-snug">{version.nom}</p>
                    <p className="text-slate-500 text-xs mt-1 font-medium">
                      Code : <span className="text-slate-700 font-extrabold">{version.motorisation || 'Non specifie'}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 rounded-xl p-2"
                      onClick={() => {
                        setEditingVersion(version);
                        setFormData({
                          nom: version.nom,
                          code: version.motorisation || '',
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
                      onClick={() => handleDelete(version.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">
              {editingVersion ? 'Modifier une version' : 'Nouvelle version'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                  {editingVersion ? 'Modifier' : 'Creer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
