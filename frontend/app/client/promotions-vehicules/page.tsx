'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Car, 
  Calendar, 
  Tag, 
  MapPin, 
  Phone, 
  AlertCircle, 
  Sparkles,
  Zap,
  Ticket,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  Info
} from 'lucide-react';
import { getActivePromotions } from '@/lib/api/vehiclePromotions';
import { VehiclePromotion } from '@/types/promotions';
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { motion, AnimatePresence } from 'framer-motion';

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

  const marques = Array.from(new Set(promotions.map(p => p.marque_nom).filter(Boolean)));

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

  if (loading) return <ClientLoadingState message="Chargement des offres véhicules..." />;

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-red-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md border border-white/10">
              <Sparkles className="h-3.5 w-3.5" />
              Offres Spéciales
            </div>
            <h1 className="mb-4 text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Nos <span className="text-red-500">Véhicules</span> en Promo
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Découvrez notre sélection exclusive de véhicules neufs à prix réduits. Profitez des meilleures offres STA Chery avant épuisement des stocks.
            </p>
          </div>

          <div className="flex gap-4">
            <ClientStatCard
              label="Offres actives"
              value={promotions.length}
              icon={Car}
              iconColor="text-red-500"
              className="bg-white/5 border-white/10 text-white min-w-[160px]"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Filters & Error ─── */}
      <div className="space-y-6">
        {marques.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => setSelectedMarque('all')}
              className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                selectedMarque === 'all'
                  ? 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 shadow-sm'
              }`}
            >
              {t('promotions.allBrands')}
            </button>
            {marques.map(marque => (
              <button
                key={marque}
                onClick={() => setSelectedMarque(marque!)}
                className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                  selectedMarque === marque
                    ? 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 shadow-sm'
                }`}
              >
                {marque}
              </button>
            ))}
          </div>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-100 text-red-600 rounded-3xl">
            <AlertCircle className="w-5 h-5" />
            <AlertDescription className="font-bold">{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* ─── Promotions Grid ─── */}
      {!loading && filteredPromotions.length === 0 ? (
        <ClientEmptyState
          icon={Car}
          title={t('promotions.noPromotions')}
          description={t('promotions.comeBackSoon')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredPromotions.map((promo, idx) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <ClientCard className="h-full flex flex-col p-0 overflow-hidden border-none shadow-xl shadow-slate-200/40 group-hover:shadow-red-500/10 transition-all duration-500">
                  {/* Image Section */}
                  <div className="relative h-64 w-full overflow-hidden">
                    {promo.image_url ? (
                      <img
                        src={promo.image_url}
                        alt={promo.titre}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <Car className="h-20 w-20 text-slate-200" />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {promo.pourcentage_reduction && (
                      <div className="absolute top-6 left-6 bg-red-500 text-white px-5 py-2 rounded-2xl font-black text-lg shadow-2xl shadow-red-500/30">
                        -{promo.pourcentage_reduction}%
                      </div>
                    )}

                    {/* Stock Badge */}
                    {promo.stock_disponible !== undefined && promo.stock_disponible !== null && (
                      <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        promo.stock_disponible > 0 ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {promo.stock_disponible > 0 ? `${promo.stock_disponible} en stock` : 'Rupture'}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">Offre limitée</p>
                      <h4 className="text-xl font-black tracking-tight">{promo.marque_nom} {promo.modele_nom}</h4>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                      <Tag className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exclusivité STA Chery</span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-red-600 transition-colors">
                      {promo.titre}
                    </h3>
                    
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                      {promo.marque_nom} {promo.modele_nom} • {promo.version_nom}
                    </p>

                    {promo.description && (
                      <p className="text-slate-500 text-sm font-medium mb-8 line-clamp-2 leading-relaxed">
                        {promo.description}
                      </p>
                    )}
                    
                    <div className="mt-auto space-y-8">
                      {/* Pricing */}
                      <div className="flex items-end justify-between border-b border-slate-100 pb-6">
                        <div>
                          {promo.prix_original && (
                            <p className="text-sm font-bold text-slate-400 line-through mb-1">
                              {formatPrice(promo.prix_original)}
                            </p>
                          )}
                          <p className="text-3xl font-black text-red-600 tracking-tight">
                            {formatPrice(promo.prix_promotion)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valide jusqu'au</p>
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-red-500" />
                            {formatDate(promo.date_fin)}
                          </p>
                        </div>
                      </div>

                      {/* Agency Info */}
                      {promo.agence_nom && (
                        <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                            <MapPin className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Disponible chez</p>
                            <p className="text-sm font-black text-slate-700 truncate">{promo.agence_nom}</p>
                            {promo.agence_telephone && (
                              <p className="text-xs font-bold text-blue-500">{promo.agence_telephone}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <ClientButton
                        variant="primary"
                        fullWidth
                        size="large"
                        icon={ArrowRight}
                      >
                        {t('promotions.contactUs')}
                      </ClientButton>
                      
                      {promo.conditions && (
                        <div className="flex gap-2 text-[10px] font-bold text-slate-400 italic">
                          <Info className="h-3 w-3 shrink-0" />
                          <span>{promo.conditions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </ClientCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ClientPageWrapper>
  );
}
