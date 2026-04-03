'use client';

import { useState, useEffect } from 'react';
import { fetchAppointments, confirmAppointment, startIntervention, finishIntervention, cancelAppointment } from '@/lib/api/agentDashboard';
import { Appointment } from '@/types/agentDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, User, Car, Wrench, List } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  token: string;
}

export default function AppointmentsTable({ token }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'date' | 'all'>('date');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id?: number;
    action?: 'confirm' | 'start' | 'finish' | 'cancel';
  }>({ open: false });

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, viewMode]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const filters = viewMode === 'date' 
        ? { fromDate: selectedDate, toDate: selectedDate }
        : {};
      const data = await fetchAppointments(token, filters);
      setAppointments(data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les rendez-vous' });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (statut: string): string => {
    const map: Record<string, string> = {
      PLANIFIE: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      CONFIRME: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      EN_COURS: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      TERMINE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      ANNULE: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return map[statut] || map.PLANIFIE;
  };

  const statusLabel = (statut: string): string => {
    const map: Record<string, string> = {
      PLANIFIE: 'Planifié',
      CONFIRME: 'Confirmé',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé',
      ANNULE: 'Annulé',
    };
    return map[statut] || statut;
  };

  const handleAction = async () => {
    if (!confirmDialog.id || !confirmDialog.action) return;

    try {
      let actionFn;
      let label = '';

      switch (confirmDialog.action) {
        case 'confirm':
          actionFn = confirmAppointment;
          label = 'Rendez-vous confirmé';
          break;
        case 'start':
          actionFn = startIntervention;
          label = 'Intervention démarrée';
          break;
        case 'finish':
          actionFn = finishIntervention;
          label = 'Intervention terminée';
          break;
        case 'cancel':
          actionFn = (t: string, id: number) =>
            cancelAppointment(t, id, 'Annulé par agent');
          label = 'Rendez-vous annulé';
          break;
      }

      await actionFn(token, confirmDialog.id);
      toast.success(label);
      loadAppointments();
    } catch (e: any) {
      toast.error('Erreur', {
        description: e.response?.data?.error || 'Erreur inconnue',
      });
    } finally {
      setConfirmDialog({ open: false });
    }
  };

  const renderActionButton = (rdv: Appointment) => {
    switch (rdv.statut) {
      case 'PLANIFIE':
        return (
          <Button
            onClick={() =>
              setConfirmDialog({ open: true, id: rdv.id, action: 'confirm' })
            }
            className="bg-blue-600 hover:bg-blue-500"
            size="sm"
          >
            Confirmer
          </Button>
        );
      case 'CONFIRME':
        return (
          <Button
            onClick={() =>
              setConfirmDialog({ open: true, id: rdv.id, action: 'start' })
            }
            className="bg-violet-600 hover:bg-violet-500"
            size="sm"
          >
            Démarrer
          </Button>
        );
      case 'EN_COURS':
        return (
          <Button
            onClick={() =>
              setConfirmDialog({ open: true, id: rdv.id, action: 'finish' })
            }
            className="bg-emerald-600 hover:bg-emerald-500"
            size="sm"
          >
            Terminer
          </Button>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with View Mode Toggle and Date Picker */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-orange-500" />
          Gestion des Rendez-vous
        </h2>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('date')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'date'
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Par date
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              Tous
            </button>
          </div>

          {/* Date Picker (only visible in date mode) */}
          {viewMode === 'date' && (
            <div className="flex items-center gap-3">
              <label htmlFor="date-picker" className="text-slate-400 text-sm">
                Date:
              </label>
              <input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{appointments.length}</p>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
          <p className="text-sky-400 text-sm">Planifiés</p>
          <p className="text-2xl font-bold text-sky-500">
            {appointments.filter((a) => a.statut === 'PLANIFIE').length}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Confirmés</p>
          <p className="text-2xl font-bold text-blue-500">
            {appointments.filter((a) => a.statut === 'CONFIRME').length}
          </p>
        </div>
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
          <p className="text-violet-400 text-sm">En cours</p>
          <p className="text-2xl font-bold text-violet-500">
            {appointments.filter((a) => a.statut === 'EN_COURS').length}
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Terminés</p>
          <p className="text-2xl font-bold text-emerald-500">
            {appointments.filter((a) => a.statut === 'TERMINE').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-slate-400 mt-4">Chargement...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Aucun rendez-vous</p>
            <p className="text-slate-500 text-sm">
              {viewMode === 'date' 
                ? `pour le ${new Date(selectedDate).toLocaleDateString('fr-FR')}`
                : 'dans le système'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  {viewMode === 'all' && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Heure
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <User className="w-4 h-4 inline mr-2" />
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Car className="w-4 h-4 inline mr-2" />
                    Véhicule
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Wrench className="w-4 h-4 inline mr-2" />
                    Services
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {appointments.map((rdv) => (
                  <tr
                    key={rdv.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Date (only in "all" mode) */}
                    {viewMode === 'all' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">
                          {formatDate(rdv.date_rendez_vous)}
                        </span>
                      </td>
                    )}

                    {/* Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-mono font-semibold text-lg">
                        {formatTime(rdv.date_rendez_vous)}
                      </span>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {rdv.client_nom} {rdv.client_prenom}
                        </p>
                        <p className="text-slate-400 text-sm">{rdv.client_telephone}</p>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {rdv.marque_nom} {rdv.modele_nom}
                        </p>
                        <p className="text-slate-400 text-sm font-mono">
                          {rdv.immatriculation}
                        </p>
                      </div>
                    </td>

                    {/* Services */}
                    <td className="px-6 py-4">
                      {rdv.interventions?.length > 0 ? (
                        <div className="space-y-1">
                          {rdv.interventions.slice(0, 2).map((inv) => (
                            <div key={inv.id} className="text-sm">
                              <span className="text-slate-300">{inv.sous_type_nom}</span>
                            </div>
                          ))}
                          {rdv.interventions.length > 2 && (
                            <span className="text-xs text-slate-500">
                              +{rdv.interventions.length - 2} autre(s)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm italic">Aucun</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge className={statusColor(rdv.statut)} variant="outline">
                        {statusLabel(rdv.statut)}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {rdv.statut !== 'ANNULE' && rdv.statut !== 'TERMINE' && (
                          <Button
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                id: rdv.id,
                                action: 'cancel',
                              })
                            }
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            Annuler
                          </Button>
                        )}
                        {renderActionButton(rdv)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open: boolean) =>
          setConfirmDialog({ open, id: confirmDialog.id, action: confirmDialog.action })
        }
      >
        <DialogContent>
          <DialogTitle>Confirmer l'action</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir continuer ? Cette action ne peut pas être annulée.
          </DialogDescription>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false })}
            >
              Annuler
            </Button>
            <Button onClick={handleAction} className="bg-blue-600 hover:bg-blue-500">
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
