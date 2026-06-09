'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Palette, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getAllColors, createColor, updateColor, deleteColor } from '@/lib/api/colors';

interface Color {
  id: number;
  nom: string;
  code_hex?: string;
  actif: boolean;
}

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    code_hex: '#FFFFFF',
    actif: true
  });

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      setIsLoading(true);
      const data = await getAllColors();
      setColors(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des couleurs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (color?: Color) => {
    if (color) {
      setEditingColor(color);
      setFormData({
        nom: color.nom,
        code_hex: color.code_hex || '#FFFFFF',
        actif: color.actif
      });
    } else {
      setEditingColor(null);
      setFormData({
        nom: '',
        code_hex: '#FFFFFF',
        actif: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingColor(null);
    setFormData({
      nom: '',
      code_hex: '#FFFFFF',
      actif: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      toast.error('Le nom de la couleur est requis');
      return;
    }

    const normalizedName = formData.nom.trim().toLowerCase();
    const duplicate = colors.find((color) => {
      if (editingColor && color.id === editingColor.id) return false;
      return color.nom.trim().toLowerCase() === normalizedName;
    });

    if (duplicate) {
      toast.error('Cette couleur existe deja');
      return;
    }

    try {
      if (editingColor) {
        await updateColor(editingColor.id, formData);
        toast.success('Couleur modifiée avec succès');
      } else {
        await createColor(formData);
        toast.success('Couleur créée avec succès');
      }
      handleCloseModal();
      loadColors();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Erreur lors de la sauvegarde';
      toast.error(message);
      console.error(error);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la couleur "${nom}" ?`)) {
      return;
    }

    try {
      await deleteColor(id);
      toast.success('Couleur supprimée avec succès');
      loadColors();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Erreur lors de la suppression';
      toast.error(message);
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <Palette className="w-7 h-7 text-orange-500" />
            Nuancier & Couleurs
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gérez le catalogue des teintes de carrosserie et des intérieurs configurables.</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle couleur
        </Button>
      </div>

      {/* Colors Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {colors.length === 0 ? (
          <div className="p-16 text-center">
            <Palette className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucune couleur enregistrée dans le nuancier</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Couleur</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aperçu</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Code Hexadécimal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Visibilité</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colors.map((color) => (
                  <tr key={color.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{color.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="w-9 h-9 rounded-full border border-slate-200 shadow-sm"
                        style={{ backgroundColor: color.code_hex || '#FFFFFF' }}
                        title={color.code_hex || 'Non défini'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-slate-500">
                      {color.code_hex || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          color.actif
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {color.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(color)}
                          className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(color.id, color.nom)}
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
              {editingColor ? 'Modifier la couleur' : 'Ajouter une nouvelle couleur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom de la couleur</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: Gris Shark, Noir Nacré..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Code couleur (Hexadécimal)</label>
                <div className="flex gap-2.5">
                  <input
                    type="color"
                    value={formData.code_hex}
                    onChange={(e) => setFormData({ ...formData, code_hex: e.target.value })}
                    className="w-12 h-10 border border-slate-200 rounded-xl cursor-pointer bg-slate-50 p-1"
                  />
                  <input
                    type="text"
                    value={formData.code_hex}
                    onChange={(e) => setFormData({ ...formData, code_hex: e.target.value })}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none font-mono font-bold"
                    placeholder="#FFFFFF"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                  Format standard : #RRGGBB (par exemple, #E15E26 pour le orange Chery)
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="actif" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Activer la visibilité pour les clients
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
                  onClick={handleCloseModal}
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
