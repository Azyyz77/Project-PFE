'use client';

import { useState, useEffect } from 'react';
import { promotionsApi } from '@/lib/api/promotions';
import { 
  Tag, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Gift, 
  Zap,
  Ticket,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { motion, AnimatePresence } from 'framer-motion';

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

  if (loading) return <ClientLoadingState message="Recherche des meilleures offres..." />;

  const activeCount = promotions.filter(p => isPromotionActive(p)).length;

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-white shadow-md"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-400 backdrop-blur-md border border-white/10">
              <Zap className="h-3.5 w-3.5" />
              Offres Exclusives
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-bold tracking-tight leading-none">
              Nos <span className="text-blue-500">Promotions</span>
            </h1>
            <p className="text-[#B0B3B8] font-medium text-lg leading-relaxed">
              Découvrez nos offres spéciales et avantages exclusifs pour l'entretien et l'achat de votre véhicule STA Chery.
            </p>
          </div>

          <div className="flex gap-4">
            <ClientStatCard
              label="Offres actives"
              value={activeCount}
              icon={Ticket}
              iconColor="text-blue-500"
              className="bg-white/5 border-white/10 text-white min-w-[160px]"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Content Grid ─── */}
      {promotions.length === 0 ? (
        <ClientEmptyState
          icon={Tag}
          title="Aucune promotion"
          description="Nous n'avons pas d'offres en cours pour le moment. Revenez bientôt !"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {promotions.map((promo, idx) => {
              const daysLeft = getDaysRemaining(promo.date_fin);
              const isActive = isPromotionActive(promo);
              
              return (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <ClientCard className="h-full flex flex-col p-0 overflow-hidden border-none shadow-sm shadow-slate-200/40 group-hover:shadow-blue-500/10 transition-all duration-500">
                    {/* Image Section */}
                    <div className="relative h-56 w-full overflow-hidden">
                      {promo.image_url ? (
                        <img
                          src={promo.image_url}
                          alt={promo.titre}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#E4E6EB] flex items-center justify-center">
                          <Gift className="h-16 w-16 text-slate-200" />
                        </div>
                      )}
                      
                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {isActive && (
                          <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg">
                            Actif
                          </div>
                        )}
                      </div>

                      {isActive && daysLeft <= 7 && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm animate-pulse">
                          <Clock className="w-3 h-3" />
                          {daysLeft} Jours
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <p className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                          Voir les détails <ChevronRight className="h-3 w-3" />
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-4 text-blue-500">
                        <Tag className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Promotion Exclusive</span>
                      </div>

                      <h3 className="text-2xl font-bold text-[#050505] tracking-tight mb-4 group-hover:text-blue-600 transition-colors">
                        {promo.titre}
                      </h3>
                      
                      {promo.description && (
                        <p className="text-[#8A8D91] text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                          {promo.description}
                        </p>
                      )}
                      
                      <div className="mt-auto space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#F0F2F5] border border-[#E4E6EB]">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Validité</p>
                            <p className="text-xs font-bold text-slate-700">
                              Jusqu'au {new Date(promo.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-white border border-[#E4E6EB] flex items-center justify-center shadow-sm">
                            <Calendar className="h-5 w-5 text-[#B0B3B8]" />
                          </div>
                        </div>

                        <ClientButton
                          variant={isActive ? "primary" : "secondary"}
                          fullWidth
                          size="large"
                          disabled={!isActive}
                          icon={ArrowRight}
                        >
                          En profiter
                        </ClientButton>
                      </div>
                    </div>
                  </ClientCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ─── CTA Section ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="rounded-xl bg-[#E4E6EB] p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-blue-500/5 blur-3xl rounded-full" />
        <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-[#050505] mb-4 tracking-tight">Ne manquez aucune opportunité</h2>
        <p className="text-[#8A8D91] font-medium max-w-lg mx-auto mb-8">
          Inscrivez-vous à notre newsletter pour recevoir nos dernières promotions et actualités directement dans votre boîte mail.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="votre@email.com" 
            className="flex-1 bg-white border-none rounded-lg px-6 py-4 font-medium shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none"
          />
          <ClientButton variant="primary" size="large">S'inscrire</ClientButton>
        </div>
      </motion.div>
    </ClientPageWrapper>
  );
}
