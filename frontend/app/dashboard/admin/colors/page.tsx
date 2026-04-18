'use client';

import { useState, useEffect } from 'react';
import { colorsApi, Color } from '@/lib/api/colors';

export default function ColorsAdminPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    code_hex: '',
    actif: true,
  });

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      setLoading(true);
      const response = await colorsApi.getAllColors();
      setColors(response || []);
    } catch (error) {
      console.error('Erreur:', error);
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingColor) {
        await colorsApi.updateColor(editingColor.id, formData);
      } else {
        await colorsApi.createColor(formData);
      }
      setShowModal(false);
      resetForm();
      loadColors();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette couleur ?')) {
      try {
        await colorsApi.deleteColor(id);
        loadColors();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', code_hex: '', actif: true });
    setEditingColor(null);
  };

  const openEditModal = (color: Color) => {
    setEditingColor(color);
    setFormData({
      nom: color.nom,
      code_hex: color.code_hex || '',
      actif: color.actif,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Couleurs</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          + Nouvelle Couleur
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-300">Chargement...</div>
      ) : colors && colors.length > 0 ? (
        <div className="bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Couleur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Code Hex
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {colors.map(color => (
                <tr key={color.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="w-10 h-10 rounded border border-slate-700"
                      style={{ backgroundColor: color.code_hex || '#CCCCCC' }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">{color.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-300">
                    {color.code_hex || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        color.actif ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                      }`}
                    >
                      {color.actif ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(color)}
                      className="text-cyan-400 hover:text-cyan-300 mr-4"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(color.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-300">
          Aucune couleur trouvée. Cliquez sur "Nouvelle Couleur" pour en ajouter une.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border border-slate-800">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">
              {editingColor ? 'Modifier' : 'Nouvelle'} Couleur
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Code Hex</label>
                  <input
                    type="text"
                    placeholder="#FFFFFF"
                    value={formData.code_hex}
                    onChange={(e) => setFormData({ ...formData, code_hex: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                  {formData.code_hex && (
                    <div
                      className="mt-2 w-full h-10 rounded border border-slate-700"
                      style={{ backgroundColor: formData.code_hex }}
                    />
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="actif" className="text-sm font-medium text-slate-300">Active</label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  {editingColor ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
