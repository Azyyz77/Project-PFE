'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getFeedbackStats, getDurationStats, getFeedbacks } from '@/lib/api/appointmentFeedback';
import type { FeedbackStats, DurationStats, Feedback } from '@/lib/api/appointmentFeedback';
import { Star, Clock, MessageSquare, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function StatisticsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [durationStats, setDurationStats] = useState<DurationStats | null>(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT'].includes(user.role))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

  const loadStats = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [feedback, duration, feedbacks] = await Promise.all([
        getFeedbackStats(token),
        getDurationStats(token),
        getFeedbacks(token, {})
      ]);
      
      setFeedbackStats(feedback);
      setDurationStats(duration);
      setRecentFeedbacks(feedbacks.slice(0, 10));
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les statistiques' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-orange-500" />
          Statistiques & Feedbacks
        </h2>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-slate-400 mt-4">Chargement...</p>
        </div>
      ) : (
        <>
          {/* Feedback Stats */}
          {feedbackStats && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                Satisfaction Client
              </h3>
              <div className="grid grid-cols-6 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Total Avis</p>
                  <p className="text-2xl font-bold text-white">{feedbackStats.total_feedbacks}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                  <p className="text-orange-400 text-sm">Note Moyenne</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {feedbackStats.note_moyenne.toFixed(1)} / 5
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-emerald-400 text-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-emerald-400" /> 5
                  </p>
                  <p className="text-2xl font-bold text-emerald-500">{feedbackStats.note_5}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-400 text-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-blue-400" /> 4
                  </p>
                  <p className="text-2xl font-bold text-blue-500">{feedbackStats.note_4}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-400 text-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> 3
                  </p>
                  <p className="text-2xl font-bold text-amber-500">{feedbackStats.note_3}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-red-400" /> 1-2
                  </p>
                  <p className="text-2xl font-bold text-red-500">
                    {feedbackStats.note_1 + feedbackStats.note_2}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Duration Stats */}
          {durationStats && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Performance Temporelle
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">RDV Terminés</p>
                  <p className="text-2xl font-bold text-white">{durationStats.total_rdv_termines}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-400 text-sm">Durée Estimée</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {Math.round(durationStats.duree_moyenne_estimee)} min
                  </p>
                </div>
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
                  <p className="text-violet-400 text-sm">Durée Réelle</p>
                  <p className="text-2xl font-bold text-violet-500">
                    {Math.round(durationStats.duree_moyenne_reelle)} min
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-emerald-400 text-sm">Dans les Temps</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {Math.round((durationStats.dans_les_temps / durationStats.total_rdv_termines) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Feedbacks */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Derniers Avis Clients
            </h3>
            <div className="space-y-3">
              {recentFeedbacks.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                  <p className="text-slate-400">Aucun feedback pour le moment</p>
                </div>
              ) : (
                recentFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-orange-500/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">
                          {feedback.client_prenom} {feedback.client_nom}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {feedback.marque_nom} {feedback.modele_nom} - {feedback.immatriculation}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= feedback.feedback_note
                                  ? 'fill-orange-500 text-orange-500'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-slate-500 text-sm">
                          {formatDate(feedback.date_feedback)}
                        </span>
                      </div>
                    </div>
                    {feedback.feedback_commentaire && (
                      <p className="text-slate-300 text-sm italic bg-slate-800/50 p-3 rounded-lg">
                        "{feedback.feedback_commentaire}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
