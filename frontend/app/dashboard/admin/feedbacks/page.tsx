'use client';

import { useState, useEffect } from 'react';
import { feedbackApi, Feedback } from '@/lib/api/feedback';

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
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const renderStars = (note: number) => {
    return '⭐'.repeat(note) + '☆'.repeat(5 - note);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Consultation des Feedbacks</h1>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-300">Chargement...</div>
      ) : (
        <div className="bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">RDV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Commentaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {feedbacks.map(feedback => (
                <tr key={feedback.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">
                    {feedback.client_nom || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">
                    {renderStars(feedback.feedback_note)}
                  </td>
                  <td className="px-6 py-4 text-slate-300 max-w-md truncate">
                    {feedback.feedback_commentaire || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {feedback.date_feedback ? formatDate(feedback.date_feedback) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
