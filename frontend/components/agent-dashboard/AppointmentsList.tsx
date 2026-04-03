'use client';

import { useState, useEffect } from 'react';
import { fetchAppointments, confirmAppointment, startIntervention, finishIntervention, cancelAppointment } from '@/lib/api/agentDashboard';
import { Appointment } from '@/types/agentDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { User, Wrench, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  token: string;
}

export default function AppointmentsList({ token }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id?: number;
    action?: 'confirm' | 'start' | 'finish' | 'cancel';
  }>({ open: false });

  useEffect(() => {
    if (token) {
      loadAppointments();
    }
  }, [filter, token]);

  const loadAppointments = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await fetchAppointments(token, { statut: filter || undefined });
      setAppointments(data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les rendez-vous' });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (statut: string): { border: string; bg: string; badge: string } => {
    const map: Record<
      string,
      { border: string; bg: string; badge: string }
    > = {
      PLANIFIE: {
        border: 'border-l-amber-500',
        bg: 'bg-amber-500/10',
        badge: 'bg-amber-500/20 text-amber-500',
      },
      CONFIRME: {
        border: 'border-l-blue-500',
        bg: 'bg-blue-500/10',
        badge: 'bg-blue-500/20 text-blue-400',
      },
      EN_COURS: {
        border: 'border-l-violet-500',
        bg: 'bg-violet-500/10',
        badge: 'bg-violet-500/20 text-violet-400',
      },
      TERMINE: {
        border: 'border-l-emerald-500',
        bg: 'bg-emerald-500/10',
        badge: 'bg-emerald-500/20 text-emerald-400',
      },
      ANNULE: {
        border: 'border-l-red-500',
        bg: 'bg-red-500/10',
        badge: 'bg-red-500/20 text-red-400',
      },
    };
    return map[statut] || map.PLANIFIE;
  };

  const handleAction = async () => {
    if (!confirmDialog.id || !confirmDialog.action || !token) return;

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestion des Rendez-vous</h2>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="">Tous</TabsTrigger>
          <TabsTrigger value="PLANIFIE">Planifiés</TabsTrigger>
          <TabsTrigger value="CONFIRME">Confirmés</TabsTrigger>
          <TabsTrigger value="EN_COURS">En cours</TabsTrigger>
          <TabsTrigger value="TERMINE">Terminés</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 bg-slate-800" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center p-12 bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-slate-400 mb-2">Aucun rendez-vous</p>
              <p className="text-slate-500 text-sm">
                {filter ? 'pour ce statut' : 'pour le moment'}
              </p>
            </div>
          ) : (
            appointments.map((rdv) => {
              const colors = statusColor(rdv.statut);
              return (
                <div
                  key={rdv.id}
                  className={`bg-slate-900 border-l-4 border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors ${colors.border} ${colors.bg}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg font-mono">
                          {new Date(rdv.date_rendez_vous).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </h3>
                        <Badge className={colors.badge} variant="outline">
                          {rdv.statut}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <span>🚗</span>
                        {rdv.marque_nom} {rdv.modele_nom} — {rdv.immatriculation}
                      </p>
                    </div>
                    <div className="flex gap-2">
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
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                    {/* Client */}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Client
                      </p>
                      <p className="text-white font-medium">
                        {rdv.client_nom} {rdv.client_prenom}
                      </p>
                      <p className="text-slate-400 text-sm">{rdv.client_telephone}</p>
                      <p className="text-slate-400 text-sm">{rdv.client_email}</p>
                    </div>

                    {/* Interventions */}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Interventions
                      </p>
                      {rdv.interventions?.length > 0 ? (
                        <ul className="space-y-2">
                          {rdv.interventions.map((inv) => (
                            <li key={inv.id} className="flex justify-between items-start">
                              <span className="text-slate-300 text-sm">
                                {inv.type_nom} ({inv.sous_type_nom})
                              </span>
                              <span className="text-emerald-400 font-mono font-semibold text-sm">
                                {inv.prix} DT
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 text-sm italic">
                          Aucune intervention
                        </p>
                      )}
                    </div>
                  </div>

                  {rdv.description && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border-l-2 border-slate-700">
                      <p className="text-slate-300 text-sm italic">
                        "{rdv.description}"
                      </p>
                    </div>
                  )}

                  {rdv.statut === 'TERMINE' && (
                    <div className="mt-4 flex items-center gap-3 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 text-sm font-medium">
                        Durée réelle : {rdv.duree_reelle} minutes
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

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
