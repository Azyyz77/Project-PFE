'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Car, Calendar, Tag, MapPin, Phone, AlertCircle, Sparkles } from 'lucide-react';
import { getActivePromotions } from '@/lib/api/vehiclePromotions';
import { VehiclePromotion } from '@/types/promotions';

export default function PromotionsVehiculesPage() {
  const { t } = useLanguage();
  const [promotions, setPromotions] = useState<VehiclePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarque, setSelectedMarque] = useState<string>('all');

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await getActivePromotions();
      setPromotions(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les marques uniques
  const marques = Array.from(new Set(promotions.map(p => p.marque_nom).filter(Boolean)));

  // Filtrer les promotions
  const filteredPromotions = selectedMarque === 'all'
    ? promotions
    : promotions.filter(p => p.marque_nom === selectedMarque);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E30613] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">{t('promotions.loadingPromotions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E30613] to-[#C00510] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10" />
            <h1 className="text-4xl font-bold">{t('promotions.title')}</h1>
          </div>
          <p className="text-white/90 text-lg">
            {t('promotions.discoverOffers')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtres */}
        {marques.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedMarque('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedMarque === 'all'
                  ? 'bg-[#E30613] text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('promotions.allBrands')}
            </button>
            {marques.map(marque => (
              <button
                key={marque}
                onClick={() => setSelectedMarque(marque!)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedMarque === marque
                    ? 'bg-[#E30613] text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {marque}
              </button>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPromotions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {t('promotions.noPromotions')}
            </h3>
            <p className="text-slate-500">
              {t('promotions.comeBackSoon')}
            </p>
          </div>
        )}

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map(promo => (
            <div
              key={promo.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                {promo.image_url ? (
                  <img
                    src={promo.image_url}
                    alt={promo.titre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-20 h-20 text-slate-300" />
                  </div>
                )}
                
                {/* Badge Réduction */}
                {promo.pourcentage_reduction && (
                  <div className="absolute top-4 right-4 bg-[#E30613] text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    -{promo.pourcentage_reduction}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Titre */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {promo.titre}
                </h3>

                {/* Véhicule Info */}
                {(promo.marque_nom || promo.modele_nom) && (
                  <div className="flex items-center gap-2 text-slate-600 mb-3">
                    <Car className="w-4 h-4" />
                    <span className="text-sm">
                      {promo.marque_nom} {promo.modele_nom} {promo.version_nom}
                    </span>
                  </div>
                )}

                {/* Description */}
                {promo.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {promo.description}
                  </p>
                )}

                {/* Prix */}
                <div className="mb-4">
                  {promo.prix_original && (
                    <div className="text-slate-400 line-through text-sm">
                      {formatPrice(promo.prix_original)}
                    </div>
                  )}
                  <div className="text-2xl font-bold text-[#E30613]">
                    {formatPrice(promo.prix_promotion)}
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {t('promotions.until')} {formatDate(promo.date_fin)}
                  </span>
                </div>

                {/* Stock */}
                {promo.stock_disponible !== undefined && promo.stock_disponible !== null && (
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span className={promo.stock_disponible > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {promo.stock_disponible > 0
                        ? `${promo.stock_disponible} ${t('promotions.vehiclesAvailable')}`
                        : t('promotions.outOfStock')}
                    </span>
                  </div>
                )}

                {/* Agence */}
                {promo.agence_nom && (
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">{promo.agence_nom}</div>
                        {promo.agence_adresse && (
                          <div className="text-xs text-slate-500">{promo.agence_adresse}</div>
                        )}
                      </div>
                    </div>
                    {promo.agence_telephone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${promo.agence_telephone}`} className="hover:text-[#E30613]">
                          {promo.agence_telephone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditions */}
                {promo.conditions && (
                  <div className="mt-4 text-xs text-slate-500 italic">
                    {promo.conditions}
                  </div>
                )}

                {/* CTA Button */}
                <button className="w-full mt-4 bg-[#E30613] hover:bg-[#C00510] text-white py-3 rounded-xl font-semibold transition-colors">
                  {t('promotions.contactUs')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
