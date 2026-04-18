'use client';

import { useState, useEffect } from 'react';
import { promotionsApi, Promotion } from '@/lib/api/promotions';

export default function PromotionsAdminPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    image_url: '',
    date_debut: '',
    date_fin: '',
    actif: true,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionsApi.getAllPromotions();
      setPromotions(response || []);
    } catch (error) {
      console.error('Erreur:', error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    const startDate = new Date(formData.date_debut);
    const endDate = new Date(formData.date_fin);
    
    if (endDate <= startDate) {
      alert('La date de fin doit être après la date de début');
      return;
    }
    
    try {
      if (editingPromotion) {
        await promotionsApi.updatePromotion(editingPromotion.id, formData);
      } else {
        await promotionsApi.createPromotion(formData);
      }
      setShowModal(false);
      resetForm();
      loadPromotions();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde de la promotion');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      try {
        await promotionsApi.deletePromotion(id);
        loadPromotions();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      image_url: '',
      date_debut: '',
      date_fin: '',
      actif: true,
    });
    setEditingPromotion(null);
  };

  const openEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      titre: promotion.titre,
      description: promotion.description || '',
      image_url: promotion.image_url || '',
      date_debut: promotion.date_debut.split('T')[0],
      date_fin: promotion.date_fin.split('T')[0],
      actif: promotion.actif,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Promotions</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          + Nouvelle Promotion
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-300">Chargement...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:shadow-lg transition">
              {promo.image_url && (
                <img
                  src={promo.image_url}
                  alt={promo.titre}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              )}
              <h3 className="font-semibold text-lg mb-2 text-slate-100">{promo.titre}</h3>
              <p className="text-slate-400 text-sm mb-2 line-clamp-2">{promo.description}</p>
              <div className="text-xs text-slate-500 mb-2">
                <div>Début: {new Date(promo.date_debut).toLocaleDateString()}</div>
                <div>Fin: {new Date(promo.date_fin).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    promo.actif ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                  }`}
                >
                  {promo.actif ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(promo)}
                  className="flex-1 px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg max-w-2xl w-full p-6 border border-slate-800">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">
              {editingPromotion ? 'Modifier' : 'Nouvelle'} Promotion
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Titre *</label>
                  <input
                    type="text"
                    required
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
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
                  <label className="block text-sm font-medium mb-1 text-slate-300">URL de l'image</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Date de début *</label>
                    <input
                      type="date"
                      required
                      value={formData.date_debut}
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Date de fin *</label>
                    <input
                      type="date"
                      required
                      value={formData.date_fin}
                      onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>
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
                  {editingPromotion ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
