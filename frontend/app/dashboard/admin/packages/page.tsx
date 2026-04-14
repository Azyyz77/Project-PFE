'use client';

import { useState, useEffect } from 'react';
import { packagesApi, Package } from '@/lib/api/packages';

export default function PackagesAdminPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: 0,
    duree_estimee: '',
    actif: true,
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await packagesApi.getAllPackages();
      setPackages(response.data || response || []);
    } catch (error) {
      console.error('Erreur:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        sous_types: [] // Tableau vide pour l'instant, à implémenter plus tard
      };
      
      if (editingPackage) {
        await packagesApi.updatePackage(editingPackage.id, dataToSend);
      } else {
        await packagesApi.createPackage(dataToSend);
      }
      setShowModal(false);
      resetForm();
      loadPackages();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.message || 'Une erreur est survenue');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce package ?')) {
      try {
        await packagesApi.deletePackage(id);
        loadPackages();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', description: '', prix: 0, duree_estimee: '', actif: true });
    setEditingPackage(null);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      nom: pkg.nom,
      description: pkg.description || '',
      prix: pkg.prix,
      duree_estimee: pkg.duree_estimee || '',
      actif: pkg.actif,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Packages</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          + Nouveau Package
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-300">Chargement...</div>
      ) : packages && packages.length > 0 ? (
        <div className="bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Durée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">{pkg.nom}</td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{pkg.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">{pkg.prix} DZD</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{pkg.duree_estimee || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${pkg.actif ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                      {pkg.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => openEditModal(pkg)} className="text-cyan-400 hover:text-cyan-300 mr-4">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="text-red-400 hover:text-red-300">
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
          Aucun package trouvé. Cliquez sur "Nouveau Package" pour en ajouter un.
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border border-slate-800">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">
              {editingPackage ? 'Modifier' : 'Nouveau'} Package
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
                  <label className="block text-sm font-medium mb-1 text-slate-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Prix (DZD) *</label>
                  <input
                    type="number"
                    required
                    value={formData.prix || 0}
                    onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Durée estimée</label>
                  <input
                    type="text"
                    placeholder="Ex: 2h30"
                    value={formData.duree_estimee}
                    onChange={(e) => setFormData({ ...formData, duree_estimee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="actif" className="text-sm font-medium text-slate-300">Actif</label>
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
                  {editingPackage ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
