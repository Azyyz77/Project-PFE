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
    <div className="client-page-enter space-y-6 p-6 bg-[#f5f7fa] min-h-screen">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f2f5d] via-[#173d7a] to-[#1d4f98] p-8 text-white shadow-[0_18px_40px_rgba(15,47,93,0.35)]">
        <div className="pointer-events-none absolute -right-10 top-4 h-44 w-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-24 bottom-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <p className="mb-1 text-sm text-blue-100">Offres client</p>
          <h1 className="text-3xl font-bold mb-2">Promotions en cours</h1>
          <p className="text-sm text-blue-100/90">Profitez de nos offres spéciales</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Chargement...</div>
      ) : promotions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Tag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Aucune promotion disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map(promo => {
            const daysLeft = getDaysRemaining(promo.date_fin);
            const isActive = isPromotionActive(promo);
            
            return (
              <div
                key={promo.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                  isActive ? 'border-[#0f2543]/30' : 'border-slate-200'
                }`}
              >
                {promo.image_url && (
                  <div className="relative h-48 bg-slate-100">
                    <img
                      src={promo.image_url}
                      alt={promo.titre}
                      className="w-full h-full object-cover"
                    />
                    {isActive && daysLeft <= 7 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                        <Clock className="w-3 h-3" />
                        {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl text-slate-900">{promo.titre}</h3>
                    {isActive && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    )}
                  </div>
                  
                  {promo.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{promo.description}</p>
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
                    <button className="w-full rounded-xl bg-gradient-to-r from-[#0f2543] to-[#1d4f98] px-4 py-2 font-medium text-white hover:shadow-lg">
                      Profiter de l&apos;offre
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
