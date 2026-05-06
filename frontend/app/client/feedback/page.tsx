'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMyAppointments } from '@/lib/api/appointments';
import { feedbackApi, SubmitFeedbackData } from '@/lib/api/feedback';
import { Star, MessageSquare, Send, CheckCircle, Loader2, Calendar, MapPin, Wrench } from 'lucide-react';
import { toast } from 'sonner';

// Extend the Appointment interface to include feedback fields
interface AppointmentWithFeedback {
  id: number;
  date_heure: string;
  statut: string;
  agence_nom?: string;
  agence_ville?: string;
  feedback_note?: number | null;
  feedback_commentaire?: string | null;
  date_feedback?: string | null;
  marque_nom?: string;
  modele_nom?: string;
  immatriculation?: string;
}

export default function FeedbackPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<AppointmentWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<{ [key: number]: number }>({});
  const [comments, setComments] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await getMyAppointments(token);
      // Filter only completed appointments and cast to our extended type
      const completed = data.filter((apt: any) => apt.statut === 'TERMINE') as AppointmentWithFeedback[];
      setAppointments(completed);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (rdv_id: number) => {
    if (!token) return;
    
    const note = selectedRating[rdv_id];
    if (!note) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    setSubmitting(rdv_id);
    try {
      const data: SubmitFeedbackData = {
        rdv_id,
        note,
        commentaire: comments[rdv_id] || undefined
      };
      
      console.log('Envoi du feedback:', data); // Debug
      
      const result = await feedbackApi.submitFeedback(data, token);
      console.log('Résultat:', result); // Debug
      
      toast.success('Merci pour votre avis !');
      
      // Reload appointments to update feedback status
      await loadAppointments();
      
      // Clear form
      setSelectedRating(prev => ({ ...prev, [rdv_id]: 0 }));
      setComments(prev => ({ ...prev, [rdv_id]: '' }));
    } catch (error: any) {
      console.error('Erreur feedback:', error); // Debug
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmitting(null);
    }
  };

  const renderStars = (rdv_id: number, currentRating: number | null, editable: boolean = true) => {
    const rating = currentRating || selectedRating[rdv_id] || 0;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() => editable && setSelectedRating(prev => ({ ...prev, [rdv_id]: star }))}
            className={`transition-all ${editable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">{t('feedback.title')}</h1>
          <p className="text-slate-400">{t('feedback.shareExperience')}</p>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">{t('feedback.noCompletedAppointments')}</p>
            <p className="text-slate-500 text-sm mt-2">{t('feedback.leaveReviewAfterService')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                {/* Appointment Info */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100 mb-2">
                        Rendez-vous #{appointment.id}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(appointment.date_heure)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {appointment.agence_nom} - {appointment.agence_ville}
                        </div>
                        {appointment.marque_nom && (
                          <div className="flex items-center gap-1">
                            <Wrench className="w-4 h-4" />
                            {appointment.marque_nom} {appointment.modele_nom}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {appointment.feedback_note && (
                      <div className="flex items-center gap-2 bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {t('feedback.reviewGiven')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback Form or Display */}
                {appointment.feedback_note ? (
                  // Display existing feedback
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="mb-3">
                      <p className="text-sm text-slate-400 mb-2">{t('feedback.yourRating')}</p>
                      {renderStars(appointment.id, appointment.feedback_note, false)}
                    </div>
                    {appointment.feedback_commentaire && (
                      <div>
                        <p className="text-sm text-slate-400 mb-2">{t('feedback.yourComment')}</p>
                        <p className="text-slate-300">{appointment.feedback_commentaire}</p>
                      </div>
                    )}
                    {appointment.date_feedback && (
                      <p className="text-xs text-slate-500 mt-3">
                        {t('feedback.reviewGivenOn')} {formatDate(appointment.date_feedback)}
                      </p>
                    )}
                  </div>
                ) : (
                  // Feedback form
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        {t('feedback.howRateService')}
                      </label>
                      {renderStars(appointment.id, null, true)}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('feedback.commentOptional')}
                      </label>
                      <textarea
                        value={comments[appointment.id] || ''}
                        onChange={(e) => setComments(prev => ({ ...prev, [appointment.id]: e.target.value }))}
                        placeholder={t('feedback.shareYourExperience')}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {(comments[appointment.id] || '').length}/500 {t('feedback.characters')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSubmitFeedback(appointment.id)}
                      disabled={!selectedRating[appointment.id] || submitting === appointment.id}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting === appointment.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('feedback.sending')}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          {t('feedback.sendReview')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
