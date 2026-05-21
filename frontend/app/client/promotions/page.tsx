'use client';

import { useState, useEffect } from 'react';
import { promotionsApi } from '@/lib/api/promotions';
import { Tag, Calendar, Clock } from 'lucide-react';

interface Promotion {
  id: number;
  titre: string;
  description?: string;
  image_url?: string;
  date_debut: string;
  date_fin: string;
  actif: boolean;
}

export default function ClientPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionsApi.getActivePromotions();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const isPromotionActive = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.date_debut);
    const end = new Date(promo.date_fin);
    return now >= start && now <= end && promo.actif;
  };

  const getDaysRemaining = (dateEnd: string) => {
    const now = new Date();
    const end = new Date(dateEnd);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Promotions en cours</h1>
        <p className="text-slate-400">Profitez de nos offres spéciales</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-300">Chargement...</div>
      ) : promotions.length === 0 ? (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-12 text-center">
          <Tag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucune promotion disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map(promo => {
            const daysLeft = getDaysRemaining(promo.date_fin);
            const isActive = isPromotionActive(promo);
            
            return (
              <div
                key={promo.id}
                className={`bg-slate-900 border rounded-lg overflow-hidden hover:shadow-xl transition-all ${
                  isActive ? 'border-cyan-600' : 'border-slate-800'
                }`}
              >
                {promo.image_url && (
                  <div className="relative h-48 bg-slate-800">
                    <img
                      src={promo.image_url}
                      alt={promo.titre}
                      className="w-full h-full object-cover"
                    />
                    {isActive && daysLeft <= 7 && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl text-slate-100">{promo.titre}</h3>
                    {isActive && (
                      <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  
                  {promo.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{promo.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Du {new Date(promo.date_debut).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Au {new Date(promo.date_fin).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {isActive && (
                    <button className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium">
                      Profiter de l'offre
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
