'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Loader2,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { ComplaintAttachments } from '@/components/examples/FileUploadExample';

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
  const { token } = useAuth();
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/complaints/my-complaints`, {
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
      toast.error('Erreur', { description: error.message || 'Erreur lors du chargement des réclamations' });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

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
      newErrors.sujet = 'Le sujet est obligatoire';
    }
    if (!form.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
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
      setApiError('Vous devez être connecté');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la réclamation');
      }

      toast.success('Réclamation créée avec succès!');
      setForm({ sujet: '', description: '' });
      setIsDialogOpen(false);
      loadComplaints();
    } catch (err) {
      const error = err as Error;
      const msg = error.message || 'Erreur lors de la création';
      setApiError(msg);
      toast.error('Erreur', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = (status: ComplaintStatus) => {
    const statusMap = {
      SOUMISE: {
        label: t('complaints.submitted'),
        icon: <Clock className="w-4 h-4" />,
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
      },
      EN_COURS: {
        label: t('complaints.inProgress'),
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      },
      TRAITEE: {
        label: t('complaints.processed'),
        icon: <CheckCircle className="w-4 h-4" />,
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
      },
      CLOTUREE: {
        label: t('complaints.closed'),
        icon: <XCircle className="w-4 h-4" />,
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      },
    };

    return statusMap[status] || statusMap.SOUMISE;
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{t('complaints.title')}</h1>
              <p className="text-slate-600">
                {t('complaints.manageComplaints')}
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#0f2543] to-[#1b355d] hover:shadow-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              {t('complaints.newComplaint')}
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('complaints.createComplaint')}</DialogTitle>
              </DialogHeader>

              {apiError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sujet">{t('complaints.subject')} *</Label>
                  <Input
                    id="sujet"
                    name="sujet"
                    value={form.sujet}
                    onChange={handleChange}
                    placeholder="Ex: Problème avec la réparation"
                    disabled={isSubmitting}
                    className={errors.sujet ? 'border-red-500' : ''}
                  />
                  {errors.sujet && (
                    <p className="text-xs text-red-600">{errors.sujet}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('complaints.description')} *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Décrivez votre réclamation en détail..."
                    rows={6}
                    disabled={isSubmitting}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {t('complaints.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#0f2543] to-[#1b355d] hover:shadow-lg text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('complaints.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t('complaints.send')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Complaints List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-[#0f2543]/20" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-[#0f2543]" />
            </div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {t('complaints.noComplaints')}
            </h3>
            <p className="text-slate-600 mb-4">
              {t('complaints.notCreatedYet')}
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-[#0f2543] to-[#1b355d] hover:shadow-lg text-white transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('complaints.create')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint, index) => {
              const statusInfo = getStatusInfo(complaint.statut);
              const createdDate = new Date(complaint.date_creation).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <div
                  key={complaint.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="bg-white rounded-xl p-6 border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#0f2543] animate-fade-in"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-800">{complaint.sujet}</h3>
                        <Badge className={statusInfo.className}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {t('complaints.createdOn')} {createdDate} • {t('complaints.complaintNumber')} #{complaint.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Description
                      </h4>
                      <p className="text-slate-600 whitespace-pre-wrap">
                        {complaint.description}
                      </p>
                    </div>

                    {complaint.reponse && (
                      <div className="bg-gradient-to-r from-[#0f2543]/5 to-[#1b355d]/5 border border-[#0f2543]/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-[#0f2543] mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Réponse de l'équipe
                        </h4>
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {complaint.reponse}
                        </p>
                        {complaint.date_resolution && (
                          <p className="text-xs text-slate-500 mt-2">
                            Répondu le {new Date(complaint.date_resolution).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* File Attachments Section */}
                    <div className="border-t border-slate-200 pt-4">
                      <ComplaintAttachments complaintId={complaint.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
