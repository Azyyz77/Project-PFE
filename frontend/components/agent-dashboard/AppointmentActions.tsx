'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCircle, Play, Square, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { confirmAppointment, startAppointment, completeAppointment } from '@/lib/api/appointments';

interface AppointmentActionsProps {
  appointmentId: number;
  statut: string;
  token: string;
  onSuccess: () => void;
}

export default function AppointmentActions({ 
  appointmentId, 
  statut, 
  token, 
  onSuccess 
}: AppointmentActionsProps) {
  const [loading, setLoading] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [coutReel, setCoutReel] = useState('');

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await confirmAppointment(appointmentId, token);
      toast.success('Rendez-vous confirmé avec succès');
      onSuccess();
    } catch (error: any) {
      toast.error('Erreur', { 
        description: error.message || 'Impossible de confirmer le rendez-vous' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      await startAppointment(appointmentId, token);
      toast.success('Rendez-vous démarré avec succès');
      onSuccess();
    } catch (error: any) {
      toast.error('Erreur', { 
        description: error.message || 'Impossible de démarrer le rendez-vous' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      const payload: any = {};
      if (commentaire) payload.commentaire = commentaire;
      if (coutReel) payload.cout_reel = parseFloat(coutReel);

      const result = await completeAppointment(appointmentId, payload, token);
      toast.success('Rendez-vous terminé avec succès', {
        description: `Durée: ${result.dureeReelle}`
      });
      setCompleteModalOpen(false);
      setCommentaire('');
      setCoutReel('');
      onSuccess();
    } catch (error: any) {
      toast.error('Erreur', { 
        description: error.message || 'Impossible de terminer le rendez-vous' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {statut === 'PLANIFIE' && (
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmer
          </Button>
        )}

        {['PLANIFIE', 'CONFIRME'].includes(statut) && (
          <Button
            onClick={handleStart}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Démarrer
          </Button>
        )}

        {statut === 'EN_COURS' && (
          <Button
            onClick={() => setCompleteModalOpen(true)}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            <Square className="w-4 h-4 mr-2" />
            Terminer
          </Button>
        )}
      </div>

      {/* Modal de fin de rendez-vous */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Terminer le rendez-vous</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Commentaire (optionnel)
              </label>
              <Textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Travaux effectués, observations..."
                rows={4}
                className="bg-slate-800 border-slate-700 text-white"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">
                {commentaire.length}/500 caractères
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Coût réel (TND) (optionnel)
              </label>
              <Input
                type="number"
                step="0.001"
                value={coutReel}
                onChange={(e) => setCoutReel(e.target.value)}
                placeholder="150.500"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-300">
                  La durée réelle sera calculée automatiquement entre l'heure de début et l'heure de fin.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteModalOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? 'Traitement...' : 'Terminer le RDV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
