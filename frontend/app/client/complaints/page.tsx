'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ClientPageWrapper,
  ClientCard,
  ClientCardHeader,
  ClientCardContent,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Loader2,
  Send,
  MessageCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { ComplaintAttachments } from '@/components/examples/FileUploadExample';
import { motion, AnimatePresence } from 'framer-motion';

type ComplaintStatus = 'SOUMISE' | 'EN_COURS' | 'TRAITEE' | 'CLOTUREE';

interface Complaint {
  id: number;
  sujet: string;
  description: string;
  statut: ComplaintStatus;
  date_creation: string;
  date_resolution?: string;
  reponse?: string;
}

export default function ComplaintsPage() {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    sujet: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  const loadComplaints = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/complaints/my-complaints`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error loading complaints:', error);
      toast.error(t('repairOrders.error'), { description: error.message || t('complaints.errorLoading') });
    } finally {
      setIsLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.sujet.trim()) {
      newErrors.sujet = t('complaints.subjectRequired');
    }
    if (!form.description.trim()) {
      newErrors.description = t('complaints.descriptionRequired');
    } else if (form.description.trim().length < 10) {
      newErrors.description = t('complaints.descriptionMinLength');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!token) {
      setApiError(t('complaints.mustBeLoggedIn'));
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('complaints.errorCreating'));
      }

      toast.success(t('complaints.success'));
      setForm({ sujet: '', description: '' });
      setIsDialogOpen(false);
      loadComplaints();
    } catch (err) {
      const error = err as Error;
      const msg = error.message || t('complaints.errorCreating');
      setApiError(msg);
      toast.error(t('repairOrders.error'), { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = (status: ComplaintStatus) => {
    const statusMap = {
      SOUMISE: {
        label: t('complaints.submitted'),
        icon: <Clock className="w-3.5 h-3.5" />,
        className: 'bg-amber-50 text-amber-600 border-amber-100',
      },
      EN_COURS: {
        label: t('complaints.inProgress'),
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        className: 'bg-blue-50 text-blue-600 border-blue-100',
      },
      TRAITEE: {
        label: t('complaints.processed'),
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      },
      CLOTUREE: {
        label: t('complaints.closed'),
        icon: <XCircle className="w-3.5 h-3.5" />,
        className: 'bg-[#F0F2F5] text-[#8A8D91] border-[#E4E6EB]',
      },
    };

    return statusMap[status] || statusMap.SOUMISE;
  };

  if (isLoading) {
    return <ClientLoadingState message={t('complaints.loading')} />;
  }

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-[#050505] shadow-md border border-[#E4E6EB]"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              {t('complaints.serviceClient')}
            </div>
            <h1 className="mb-4 text-4xl sm:text-3xl font-bold tracking-tight leading-none text-[#050505]">
              {t('complaints.title')}
            </h1>
            <p className="text-[#65676B] font-medium text-lg leading-relaxed">
              {t('complaints.subtitle')}
            </p>
          </div>

          <ClientButton 
            variant="primary" 
            size="large"
            onClick={() => setIsDialogOpen(true)}
            icon={Plus}
          >
            {t('complaints.newComplaint')}
          </ClientButton>
        </div>
      </motion.div>

      {/* ─── Stats Summary ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClientStatCard
          label={t('complaints.totalComplaints')}
          value={complaints.length}
          icon={MessageSquare}
          iconColor="text-blue-600"
        />
        <ClientStatCard
          label={t('complaints.inProgress')}
          value={complaints.filter(c => c.statut === 'EN_COURS' || c.statut === 'SOUMISE').length}
          icon={Clock}
          iconColor="text-amber-500"
        />
        <ClientStatCard
          label={t('complaints.processed')}
          value={complaints.filter(c => c.statut === 'TRAITEE' || c.statut === 'CLOTUREE').length}
          icon={CheckCircle}
          iconColor="text-emerald-500"
        />
      </div>

      {/* ─── Complaints List ─── */}
      <div className="space-y-6">
        {complaints.length === 0 ? (
          <ClientEmptyState
            icon={MessageCircle}
            title={t('complaints.noComplaints')}
            description={t('complaints.notCreatedYet')}
            actionLabel={t('complaints.create')}
            onAction={() => setIsDialogOpen(true)}
          />
        ) : (
          <div className="grid gap-6">
            {complaints.map((complaint, idx) => {
              const statusInfo = getStatusInfo(complaint.statut);
              const createdDate = new Date(complaint.date_creation).toLocaleDateString(t('locale') === 'ar' ? 'ar-TN' : 'fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ClientCard className="overflow-hidden border-none shadow-sm shadow-slate-200/40 bg-white">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Left Side: Info */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-[#050505] tracking-tight leading-none">
                                {complaint.sujet}
                              </h3>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${statusInfo.className}`}>
                                {statusInfo.icon}
                                {statusInfo.label}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">
                              {t('complaints.createdOn')} {createdDate} • ID: #{complaint.id}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg bg-[#F0F2F5] p-6 border border-[#E4E6EB]">
                          <h4 className="text-[10px] font-bold uppercase tracking-wide text-[#65676B] mb-3 flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" />
                            {t('complaints.problemDescription')}
                          </h4>
                          <p className="text-[#65676B] font-medium leading-relaxed whitespace-pre-wrap">
                            {complaint.description}
                          </p>
                        </div>

                        {/* Attachments */}
                        <div className="pt-4 border-t border-[#E4E6EB]">
                          <ComplaintAttachments complaintId={complaint.id} />
                        </div>
                      </div>

                      {/* Right Side: Response (if exists) */}
                      {complaint.reponse && (
                        <div className="w-full md:w-80 lg:w-96 shrink-0">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full rounded-lg bg-emerald-50/50 p-6 border border-emerald-100 flex flex-col"
                          >
                            <h4 className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 mb-4 flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              {t('complaints.officialResponse')}
                            </h4>
                            <p className="text-emerald-800 font-medium leading-relaxed italic text-sm flex-1">
                              "{complaint.reponse}"
                            </p>
                            {complaint.date_resolution && (
                              <div className="mt-6 pt-4 border-t border-emerald-100/50">
                                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wide">
                                  {t('complaints.resolvedOn')} {new Date(complaint.date_resolution).toLocaleDateString(t('locale') === 'ar' ? 'ar-TN' : 'fr-FR')}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </ClientCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── New Complaint Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-lg border-none shadow-md">
          <div className="bg-slate-50 p-10 text-[#050505] relative overflow-hidden border-b border-[#E4E6EB]">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Plus className="h-8 w-8 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wide text-[#65676B]">{t('complaints.newRequest')}</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-[#050505]">{t('complaints.createComplaint')}</h2>
              <p className="text-[#65676B] font-medium leading-relaxed">
                {t('complaints.formInstructions')}
              </p>
            </div>
          </div>

          <div className="p-10 bg-white">
            {apiError && (
              <Alert className="mb-6 bg-blue-50 border-blue-100 text-blue-600 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold">{apiError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sujet" className="text-xs font-bold uppercase tracking-wide text-[#65676B] ml-1">
                  {t('complaints.subject')} <span className="text-blue-500">*</span>
                </Label>
                <Input
                  id="sujet"
                  name="sujet"
                  value={form.sujet}
                  onChange={handleChange}
                  placeholder="Ex: Problème technique, Retard..."
                  disabled={isSubmitting}
                  className={`rounded-lg bg-[#F0F2F5] border-[#E4E6EB] py-6 px-5 font-medium transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${errors.sujet ? 'border-blue-500 ring-4 ring-blue-500/10' : ''}`}
                />
                <AnimatePresence>
                  {errors.sujet && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-bold text-blue-500 ml-1"
                    >
                      {errors.sujet}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wide text-[#65676B] ml-1">
                  {t('complaints.description')} <span className="text-blue-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre problème avec le plus de précision possible..."
                  rows={5}
                  disabled={isSubmitting}
                  className={`rounded-lg bg-[#F0F2F5] border-[#E4E6EB] p-5 font-medium transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${errors.description ? 'border-blue-500 ring-4 ring-blue-500/10' : ''}`}
                />
                <AnimatePresence>
                  {errors.description && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-bold text-blue-500 ml-1"
                    >
                      {errors.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-4 pt-6">
                <ClientButton
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  {t('complaints.cancel')}
                </ClientButton>
                <ClientButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting}
                  icon={isSubmitting ? undefined : Send}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('complaints.sending')}
                    </span>
                  ) : (
                    t('complaints.send')
                  )}
                </ClientButton>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </ClientPageWrapper>
  );
}
