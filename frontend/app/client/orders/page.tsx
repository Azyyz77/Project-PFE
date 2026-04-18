'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PhoneVerificationRequired } from '@/components/PhoneVerificationRequired';
import { getMyOrders, getOrdersStats, getOrderDetails, ClientOrder, OrdersStats, OrderDetails } from '@/lib/api/clientOrders';
import { Wrench, ArrowRight, Package, Clock, CheckCircle, Loader2, Eye, Calendar, MapPin, User, Car, FileText, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ClientOrdersPage() {
  const { token } = useAuth();
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [stats, setStats] = useState<OrdersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        getMyOrders(token),
        getOrdersStats(token)
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('orders.loadingError');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId: number) => {
    if (!token) return;
    
    setDetailsLoading(true);
    setShowDetailsModal(true);
    try {
      const details = await getOrderDetails(orderId, token);
      setSelectedOrder(details);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('orders.detailsError');
      toast.error(message);
      setShowDetailsModal(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PLANIFIE: { label: language === 'ar' ? 'مُجدول' : 'Planifié', className: 'bg-blue-100 text-blue-800' },
      CONFIRME: { label: language === 'ar' ? 'مؤكد' : 'Confirmé', className: 'bg-green-100 text-green-800' },
      EN_COURS: { label: t('common.inProgress'), className: 'bg-yellow-100 text-yellow-800' },
      TERMINE: { label: language === 'ar' ? 'مكتمل' : 'Terminé', className: 'bg-emerald-100 text-emerald-800' },
      ANNULE: { label: language === 'ar' ? 'ملغى' : 'Annulé', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[statut] || { label: statut, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <PhoneVerificationRequired message="Vous devez vérifier votre numéro de téléphone pour pouvoir consulter vos commandes.">
      <div className="w-full h-full overflow-auto bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">{t('common.repairOrders')}</h1>
        
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">{t('common.total')}</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total_commandes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-slate-600">{t('common.inProgress')}</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.en_cours}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">{t('common.completed')}</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.terminees}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-slate-600">{t('common.totalCost')}</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.cout_total?.toFixed(2) || '0.00'} TND</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-300">
            <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-6 text-lg">{t('orders.noOrders')}</p>
            <Link href="/client/rendez-vous">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <ArrowRight className="w-4 h-4" />
                {t('orders.bookAppointment')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">{t('orders.order')} #{order.id}</h3>
                      {getStatusBadge(order.statut)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.date_heure)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        {order.marque_nom} {order.modele_nom} - {order.immatriculation}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleViewDetails(order.id)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                      {t('common.details')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t('orders.agency')}</p>
                    <p className="text-sm font-medium text-slate-900">{order.agence_nom}</p>
                    <p className="text-xs text-slate-600">{order.agence_ville}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t('orders.interventions')}</p>
                    <p className="text-sm font-medium text-slate-900">{order.nombre_interventions} {language === 'ar' ? 'تدخل' : 'intervention(s)'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t('orders.cost')}</p>
                    <p className="text-sm font-medium text-slate-900">
                      {order.cout_total ? `${order.cout_total.toFixed(2)} TND` : t('orders.undefined')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('orders.detailsTitle')}</DialogTitle>
            </DialogHeader>

            {detailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : selectedOrder ? (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{t('orders.order')} #{selectedOrder.order.id}</h3>
                    {getStatusBadge(selectedOrder.order.statut)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">{t('orders.appointmentDate')}</p>
                      <p className="font-medium">{formatDate(selectedOrder.order.date_heure)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">{t('orders.estimatedDuration')}</p>
                      <p className="font-medium">{selectedOrder.order.duree_estimee} min</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    {t('orders.vehicle')}
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">{t('orders.brandModel')}</p>
                      <p className="font-medium">{selectedOrder.order.marque_nom} {selectedOrder.order.modele_nom}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">{t('orders.plate')}</p>
                      <p className="font-medium">{selectedOrder.order.immatriculation}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">{t('orders.color')}</p>
                      <p className="font-medium">{selectedOrder.order.couleur}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">{t('orders.year')}</p>
                      <p className="font-medium">{selectedOrder.order.annee}</p>
                    </div>
                  </div>
                </div>

                {/* Agency Info */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {t('orders.agency')}
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm">
                    <p className="font-medium mb-1">{selectedOrder.order.agence_nom}</p>
                    <p className="text-slate-600">{selectedOrder.order.agence_adresse}</p>
                    <p className="text-slate-600">{selectedOrder.order.agence_ville}</p>
                    <p className="text-slate-600">{language === 'ar' ? 'هاتف' : 'Tél'}: {selectedOrder.order.agence_telephone}</p>
                  </div>
                </div>

                {/* Agent Info */}
                {selectedOrder.order.agent_nom && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {t('orders.agentAssigned')}
                    </h4>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm">
                      <p className="font-medium">{selectedOrder.order.agent_nom} {selectedOrder.order.agent_prenom}</p>
                      {selectedOrder.order.agent_telephone && (
                        <p className="text-slate-600">{language === 'ar' ? 'هاتف' : 'Tél'}: {selectedOrder.order.agent_telephone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Interventions */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    {t('orders.interventions')} ({selectedOrder.interventions.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.interventions.map((intervention) => (
                      <div key={intervention.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{intervention.type_nom}</p>
                            <p className="text-sm text-slate-600">{intervention.sous_type_nom}</p>
                          </div>
                          {intervention.cout_reel && (
                            <p className="font-semibold text-orange-600">{intervention.cout_reel.toFixed(2)} TND</p>
                          )}
                        </div>
                        {intervention.commentaire && (
                          <p className="text-sm text-slate-600 mt-2">{intervention.commentaire}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments */}
                {selectedOrder.attachments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {t('orders.attachments')} ({selectedOrder.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.attachments.map((attachment) => (
                        <div key={attachment.id} className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{attachment.nom_original}</p>
                            <p className="text-xs text-slate-600">{attachment.taille_ko} Ko</p>
                          </div>
                          <a href={attachment.url_stockage} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              {t('orders.download')}
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </PhoneVerificationRequired>
  );
}
