'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, RefreshCw, Car, Tag, Calendar } from 'lucide-react';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
} from '@/lib/api/vehiclePromotions';
import { VehiclePromotion, CreateVehiclePromotionDto } from '@/types/promotions';

export default function VehiclePromotionsAdminPage() {
  const [promotions, setPromotions] = useState<VehiclePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<VehiclePromotion | null>(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await getAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette promotion ?')) return;
    
    try {
      await deletePromotion(id);
      await loadPromotions();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions Véhicules</h1>
          <p className="text-slate-600">Gérer les promotions sur les véhicules en vente</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadPromotions}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={() => {
              setEditingPromotion(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle promotion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{promotions.length}</p>
            </div>
            <Tag className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Actives</p>
              <p className="text-2xl font-bold text-green-600">
                {promotions.filter(p => p.actif).length}
              </p>
            </div>
            <Car className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Inactives</p>
              <p className="text-2xl font-bold text-slate-400">
                {promotions.filter(p => !p.actif).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Stock total</p>
              <p className="text-2xl font-bold text-amber-600">
                {promotions.reduce((sum, p) => sum + (p.stock_disponible || 0), 0)}
              </p>
            </div>
            <Car className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Titre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Véhicule</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Prix</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Période</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Statut</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {promotions.map(promo => (
              <tr key={promo.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{promo.titre}</div>
                  {promo.description && (
                    <div className="text-sm text-slate-500 line-clamp-1">{promo.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {promo.marque_nom} {promo.modele_nom}
                  {promo.version_nom && <div className="text-xs text-slate-400">{promo.version_nom}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold text-[#E30613]">{formatPrice(promo.prix_promotion)}</div>
                  {promo.prix_original && (
                    <div className="text-xs text-slate-400 line-through">{formatPrice(promo.prix_original)}</div>
                  )}
                  {promo.pourcentage_reduction && (
                    <div className="text-xs text-green-600 font-medium">-{promo.pourcentage_reduction}%</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <div>{formatDate(promo.date_debut)}</div>
                  <div className="text-xs text-slate-400">au {formatDate(promo.date_fin)}</div>
                </td>
                <td className="px-4 py-3">
                  {promo.stock_disponible !== undefined && promo.stock_disponible !== null ? (
                    <span className={`text-sm font-medium ${promo.stock_disponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {promo.stock_disponible}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    promo.actif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {promo.actif ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingPromotion(promo);
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {promotions.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Aucune promotion</p>
            <p className="text-sm text-slate-400">Créez votre première promotion véhicule</p>
          </div>
        )}
      </div>

      {/* Modal - À implémenter */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
            </h2>
            <p className="text-slate-600 mb-4">
              Formulaire à implémenter (voir prochaine étape)
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
