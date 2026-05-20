'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMyAppointments } from '@/lib/api/appointments';
import { feedbackApi, SubmitFeedbackData } from '@/lib/api/feedback';
import { 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Loader2, 
  Calendar, 
  MapPin, 
  Wrench,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  Award
} from 'lucide-react';
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { t, language } = useLanguage();
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
      toast.error(error.message || t('orders.loadingError') || 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (rdv_id: number) => {
    if (!token) return;
    
    const note = selectedRating[rdv_id];
    if (!note) {
      toast.error(t('feedback.selectRatingError'));
      return;
    }

    setSubmitting(rdv_id);
    try {
      const data: SubmitFeedbackData = {
        rdv_id,
        note,
        commentaire: comments[rdv_id] || undefined
      };
      
      await feedbackApi.submitFeedback(data, token);
      toast.success(t('feedback.thankYou'));
      
      await loadAppointments();
      
      setSelectedRating(prev => ({ ...prev, [rdv_id]: 0 }));
      setComments(prev => ({ ...prev, [rdv_id]: '' }));
    } catch (error: any) {
      toast.error(error.message || t('feedback.sendingError') || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(null);
    }
  };

  const renderStars = (rdv_id: number, currentRating: number | null, editable: boolean = true) => {
    const rating = currentRating || selectedRating[rdv_id] || 0;
    
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={!editable}
            whileHover={editable ? { scale: 1.2, rotate: 15 } : {}}
            whileTap={editable ? { scale: 0.9 } : {}}
            onClick={() => editable && setSelectedRating(prev => ({ ...prev, [rdv_id]: star }))}
            className={`transition-all ${editable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`w-10 h-10 ${
                star <= rating
                  ? 'fill-red-500 text-blue-500 shadow-sm'
                  : 'text-slate-200 fill-slate-50'
              } transition-colors duration-300`}
            />
          </motion.button>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const localeMap: any = { fr: 'fr-FR', ar: 'ar-TN', en: 'en-US' };
    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <ClientLoadingState message={t('feedback.loadingAppointments')} />;
  }

  const pendingFeedbackCount = appointments.filter(a => !a.feedback_note).length;

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-slate-800 border border-slate-200/80 shadow-sm"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
              <Award className="h-3.5 w-3.5" />
              {t('feedback.title')}
            </div>
            <h1 className="mb-4 text-4xl sm:text-3xl font-extrabold tracking-tight leading-none text-slate-900">
              {t('feedback.title')}
            </h1>
            <p className="text-slate-500 font-semibold text-lg leading-relaxed">
              {t('feedback.shareExperience')}
            </p>
          </div>

          <div className="flex gap-4">
            <ClientStatCard
              label={t('feedback.toEvaluate')}
              value={pendingFeedbackCount}
              icon={MessageSquare}
              iconColor="text-blue-500"
              className="bg-slate-50 border-slate-200/80 text-slate-800 min-w-[140px]"
            />
          </div>
        </div>
      </motion.div>
 
      {/* ─── Main Content ─── */}
      {appointments.length === 0 ? (
        <ClientEmptyState
          icon={ThumbsUp}
          title={t('feedback.noCompletedAppointments')}
          description={t('feedback.leaveReviewAfterService')}
        />
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {appointments.map((appointment, idx) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ClientCard className="overflow-hidden border border-slate-200/80 bg-white shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                            {t('feedback.appointment')} #{appointment.id}
                          </h3>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              {formatDate(appointment.date_heure)}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                              {appointment.agence_nom}
                            </div>
                          </div>                        </div>

                        {appointment.feedback_note && (
                          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">{t('feedback.reviewGiven')}</span>
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg bg-slate-50 p-6 border border-slate-200/60 flex items-center gap-6">
                        <div className="h-16 w-16 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center shadow-sm">
                          <Wrench className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{t('feedback.vehicleConcerned')}</p>
                          <p className="text-lg font-bold text-slate-700">
                            {appointment.marque_nom} {appointment.modele_nom}
                          </p>
                          <p className="text-sm font-bold text-slate-400">{appointment.immatriculation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Feedback Form or Display */}
                    <div className="w-full lg:w-[450px] shrink-0">
                      {appointment.feedback_note ? (
                        <div className="h-full rounded-lg bg-slate-50 p-8 border border-slate-200/60 flex flex-col justify-center items-center text-center space-y-6">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-4">{t('feedback.yourRating')}</p>
                            <div className="flex justify-center">
                              {renderStars(appointment.id, appointment.feedback_note, false)}
                            </div>
                          </div>
                          
                          {appointment.feedback_commentaire && (
                            <div className="w-full">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-3">{t('feedback.yourComment')}</p>
                              <div className="bg-white p-5 rounded-lg border border-slate-200/60 shadow-sm italic text-slate-600 font-semibold">
                                "{appointment.feedback_commentaire}"
                              </div>
                            </div>
                          )}
                          
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide pt-4">
                            {t('feedback.postedOn')} {formatDate(appointment.date_feedback!)}
                          </p>
                        </div>                      ) : (
                        <div className="h-full rounded-lg bg-white p-8 border border-slate-200/80 shadow-sm space-y-6">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-4">
                              {t('feedback.howRateService')}
                            </label>
                            <div className="flex justify-center lg:justify-start">
                              {renderStars(appointment.id, null, true)}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              {t('feedback.commentOptional')}
                            </label>
                            <Textarea
                              value={comments[appointment.id] || ''}
                              onChange={(e) => setComments(prev => ({ ...prev, [appointment.id]: e.target.value }))}
                              placeholder={t('feedback.shareYourExperience')}
                              rows={3}
                              maxLength={500}
                              className="rounded-lg bg-slate-50 border-slate-200/60 p-4 font-semibold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all resize-none"
                            />
                            <div className="flex justify-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                {(comments[appointment.id] || '').length}/500
                              </span>
                            </div>
                          </div>

                          <ClientButton
                            onClick={() => handleSubmitFeedback(appointment.id)}
                            disabled={!selectedRating[appointment.id] || submitting === appointment.id}
                            variant="primary"
                            fullWidth
                            size="large"
                            icon={submitting === appointment.id ? undefined : Send}
                          >
                            {submitting === appointment.id ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('feedback.sending')}
                              </span>
                            ) : (
                              t('feedback.sendReview')
                            )}
                          </ClientButton>
                        </div>
                      )}
                    </div>
                  </div>
                </ClientCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ClientPageWrapper>
  );
}

