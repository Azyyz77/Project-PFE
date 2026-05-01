'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Palette } from 'lucide-react';
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
      toast.error(error.message || 'Erreur lors de la sauvegarde');
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
      toast.error(error.message || 'Erreur lors de la suppression');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-600" />
            <CardTitle>Gestion des Couleurs</CardTitle>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une couleur
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Aperçu</th>
                  <th className="text-left py-3 px-4">Code Hex</th>
                  <th className="text-center py-3 px-4">Statut</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {colors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Aucune couleur disponible
                    </td>
                  </tr>
                ) : (
                  colors.map((color) => (
                    <tr key={color.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{color.nom}</td>
                      <td className="py-3 px-4">
                        <div
                          className="w-12 h-12 rounded border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: color.code_hex || '#FFFFFF' }}
                          title={color.code_hex || 'Aucune couleur'}
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {color.code_hex || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            color.actif
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {color.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(color)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(color.id, color.nom)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingColor ? 'Modifier la couleur' : 'Ajouter une couleur'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nom de la couleur *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ex: Blanc, Noir, Rouge..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Code couleur (Hex)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.code_hex}
                      onChange={(e) => setFormData({ ...formData, code_hex: e.target.value })}
                      className="w-16 h-10 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.code_hex}
                      onChange={(e) => setFormData({ ...formData, code_hex: e.target.value })}
                      className="flex-1 border rounded px-3 py-2 font-mono"
                      placeholder="#FFFFFF"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: #RRGGBB (ex: #FF0000 pour rouge)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="actif" className="text-sm font-medium">
                    Couleur active (visible pour les clients)
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingColor ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
