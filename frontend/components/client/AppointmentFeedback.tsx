'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
  appointmentId: number;
  onSuccess?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AppointmentFeedback({ appointmentId, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(0);
  const [hoverNote, setHoverNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (note === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_BASE}/api/appointments/${appointmentId}/feedback`,
        { note, commentaire },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Merci pour votre feedback!');
      setOpen(false);
      setNote(0);
      setCommentaire('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.response?.data?.error || 'Impossible de soumettre le feedback'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        size="sm"
      >
        <Star className="w-4 h-4 mr-2" />
        Évaluer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogTitle className="text-white">Évaluer votre rendez-vous</DialogTitle>
          <DialogDescription className="text-slate-400">
            Votre avis nous aide à améliorer nos services
          </DialogDescription>

          <div className="space-y-6 mt-4">
            {/* Rating Stars */}
            <div>
              <label className="text-sm text-slate-400 mb-3 block">
                Comment évaluez-vous votre expérience ?
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNote(star)}
                    onMouseEnter={() => setHoverNote(star)}
                    onMouseLeave={() => setHoverNote(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverNote || note)
                          ? 'fill-orange-500 text-orange-500'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {note > 0 && (
                <p className="text-center text-sm text-slate-400 mt-2">
                  {note === 5 && 'Excellent!'}
                  {note === 4 && 'Très bien'}
                  {note === 3 && 'Bien'}
                  {note === 2 && 'Moyen'}
                  {note === 1 && 'Décevant'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Commentaire (optionnel)
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Partagez votre expérience..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                {commentaire.length}/500 caractères
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || note === 0}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
