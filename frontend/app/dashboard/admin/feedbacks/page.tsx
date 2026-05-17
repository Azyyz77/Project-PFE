'use client';

import { useState, useEffect } from 'react';
import { feedbackApi, Feedback } from '@/lib/api/feedback';
import { MessageSquare, ArrowLeft, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FeedbacksAdminPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getAllFeedbacks();
      setFeedbacks(response || []);
    } catch (error) {
      console.error('Erreur:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (note: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= note ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <MessageSquare className="w-7 h-7 text-orange-500" />
            Retours & Avis Clients
          </h1>
          <p className="text-slate-500 text-xs mt-1">Consultez les notes et commentaires déposés par les clients après leurs interventions.</p>
        </div>
      </div>

      {/* Main Feedback Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-16 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucun avis client disponible pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client (Rendez-vous)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Note de satisfaction</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Commentaire</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date d'évaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {feedback.client_nom || <span className="text-slate-400 font-normal">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(feedback.feedback_note)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium max-w-md truncate">
                      {feedback.feedback_commentaire || <span className="text-slate-400 font-normal italic">Aucun commentaire laissé</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-semibold">
                      {feedback.date_feedback ? formatDate(feedback.date_feedback) : <span className="text-slate-400">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
