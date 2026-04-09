'use client';

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
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/brands`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      setBrands(result.brands || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (brandId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/catalog/brands/${brandId}/models`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      setModels(result.models || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des modèles');
    }
  };

  const handleBrandClick = (brand: Brand) => {
    setSelectedBrand(brand);
    loadModels(brand.id);
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
                <Car className="w-8 h-8" />
                Gérer marques et modèles
              </h1>
              <p className="text-white/70 mt-1">Gérez les marques et modèles de véhicules</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingBrand(null);
              setBrandForm({ nom: '' });
              setShowBrandModal(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle marque
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Marques */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Marques</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    onClick={() => handleBrandClick(brand)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedBrand?.id === brand.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{brand.nom}</p>
                        <p className="text-sm opacity-70">{brand.modeles_count} modèles</p>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modèles */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {selectedBrand ? `Modèles - ${selectedBrand.nom}` : 'Modèles'}
              </h2>
              {selectedBrand && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingModel(null);
                    setModelForm({ nom: '', marque_id: selectedBrand.id });
                    setShowModelModal(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              )}
            </div>
            {!selectedBrand ? (
              <div className="text-center py-12 text-white/50">
                Sélectionnez une marque
              </div>
            ) : (
              <div className="space-y-2">
                {models.map((model) => (
                  <div key={model.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{model.nom}</p>
                        <p className="text-white/60 text-sm">{model.versions_count} versions</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500/10"
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

        {/* Brand Modal */}
        {showBrandModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-red-900 to-red-950 rounded-xl p-6 w-full max-w-md border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingBrand ? 'Modifier' : 'Nouvelle'} marque
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Nom de la marque</label>
                  <input
                    type="text"
                    value={brandForm.nom}
                    onChange={(e) => setBrandForm({ nom: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    required
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
                    onClick={() => setShowBrandModal(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Model Modal */}
        {showModelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-red-900 to-red-950 rounded-xl p-6 w-full max-w-md border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingModel ? 'Modifier' : 'Nouveau'} modèle
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Nom du modèle</label>
                  <input
                    type="text"
                    value={modelForm.nom}
                    onChange={(e) => setModelForm({ ...modelForm, nom: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    required
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
                    onClick={() => setShowModelModal(false)}
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
