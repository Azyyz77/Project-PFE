'use client';

import { useState, useEffect } from 'react';
import { promotionsApi, Promotion } from '@/lib/api/promotions';
import { Tag, ArrowLeft, Loader2, Calendar, Image as ImageIcon, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

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
  const [submitting, setSubmitting] = useState(false);

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
      toast.error('La date de fin doit être postérieure à la date de début');
      return;
    }
    
    try {
      setSubmitting(true);
      if (editingPromotion) {
        await promotionsApi.updatePromotion(editingPromotion.id, formData);
        toast.success('Promotion mise à jour avec succès');
      } else {
        await promotionsApi.createPromotion(formData);
        toast.success('Promotion créée avec succès');
      }
      setShowModal(false);
      resetForm();
      loadPromotions();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde de la promotion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      try {
        await promotionsApi.deletePromotion(id);
        toast.success('Promotion supprimée avec succès');
        loadPromotions();
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Impossible de supprimer la promotion');
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <Tag className="w-7 h-7 text-orange-500" />
            Gestion des Promotions
          </h1>
          <p className="text-slate-500 text-xs mt-1">Créez et configurez les offres de remises et forfaits promotionnels pour l'application mobile client.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition-all"
        >
          + Nouvelle Promotion
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white border border-slate-200/80 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200/80 rounded-2xl">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Aucune offre promotionnelle enregistrée</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
              {promo.image_url ? (
                <div className="w-full h-44 overflow-hidden relative bg-slate-50 border-b border-slate-100">
                  <img
                    src={promo.image_url}
                    alt={promo.titre}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-44 bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                  <span className="text-xs">Aucun visuel associé</span>
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-1">{promo.titre}</h3>
                    {promo.actif ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100/80 shadow-none rounded-full font-bold px-2 py-0.5 text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border border-slate-200 shadow-none rounded-full font-bold px-2 py-0.5 text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">{promo.description || 'Aucune description fournie.'}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Du: {new Date(promo.date_debut).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Au: {new Date(promo.date_fin).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => openEditModal(promo)}
                      className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(promo.id)}
                      className="flex-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-bold gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal create & update */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
              {editingPromotion ? 'Modifier' : 'Créer une'} Promotion
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Remplissez les détails pour publier l'offre promotionnelle.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Titre *</label>
              <Input
                required
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Remise 20% Vidange"
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails de l'offre promotionnelle..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">URL de l'image</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Ex: https://image.url/promo.jpg"
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Date de début *</label>
                <Input
                  type="date"
                  required
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Date de fin *</label>
                <Input
                  type="date"
                  required
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="actif"
                checked={formData.actif}
                onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="actif" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Promotion active et visible
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingPromotion ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
