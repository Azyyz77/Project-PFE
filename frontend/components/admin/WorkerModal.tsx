'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { Worker, CreateWorkerData, createWorker, updateWorker } from '@/lib/api/workers';

interface Agency {
  id: number;
  nom: string;
}

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  worker?: Worker | null;
  agencies: Agency[];
}

interface WorkerFormData extends CreateWorkerData {
  actif?: boolean;
}

interface ValidationErrors {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  date_embauche?: string;
}

export default function WorkerModal({ isOpen, onClose, onSuccess, worker, agencies }: WorkerModalProps) {
  const [formData, setFormData] = useState<WorkerFormData>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    specialite: '',
    niveau_competence: 'Intermédiaire',
    agence_id: agencies[0]?.id || 1,
    date_embauche: '',
    notes: '',
    actif: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Validation functions
  const validateName = (name: string | undefined): string | undefined => {
    if (!name || !name.trim()) {
      return 'Ce champ est requis';
    }
    if (name.trim().length < 2) {
      return 'Minimum 2 caractères';
    }
    if (name.trim().length > 50) {
      return 'Maximum 50 caractères';
    }
    if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(name)) {
      return 'Caractères invalides (lettres uniquement)';
    }
    return undefined;
  };

  const validatePhone = (phone: string | undefined): string | undefined => {
    if (!phone || !phone.trim()) {
      return undefined; // Phone is optional
    }
    // Tunisian phone format: +216 XX XXX XXX or 216XXXXXXXX or XXXXXXXX
    const phoneRegex = /^(\+216|216)?[2-9]\d{7}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return 'Format invalide (ex: +216 XX XXX XXX)';
    }
    return undefined;
  };

  const validateEmail = (email: string | undefined): string | undefined => {
    if (!email || !email.trim()) {
      return undefined; // Email is optional
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Format email invalide';
    }
    if (email.length > 100) {
      return 'Maximum 100 caractères';
    }
    return undefined;
  };

  const validateDateEmbauche = (date: string | undefined): string | undefined => {
    if (!date || !date.trim()) {
      return undefined; // Date is optional
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      return 'La date ne peut pas être dans le futur';
    }
    const minDate = new Date('1950-01-01');
    if (selectedDate < minDate) {
      return 'Date invalide';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const prenomError = validateName(formData.prenom);
    const nomError = validateName(formData.nom);
    const telephoneError = validatePhone(formData.telephone);
    const emailError = validateEmail(formData.email);
    const dateError = validateDateEmbauche(formData.date_embauche);
    
    if (prenomError) errors.prenom = prenomError as string;
    if (nomError) errors.nom = nomError as string;
    if (telephoneError) errors.telephone = telephoneError as string;
    if (emailError) errors.email = emailError as string;
    if (dateError) errors.date_embauche = dateError as string;

    setValidationErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Reset form when modal opens/closes or worker changes
  useEffect(() => {
    if (isOpen) {
      if (worker) {
        // Edit mode
        setFormData({
          nom: worker.nom,
          prenom: worker.prenom,
          telephone: worker.telephone || '',
          email: worker.email || '',
          specialite: worker.specialite || '',
          niveau_competence: worker.niveau_competence || 'Intermédiaire',
          agence_id: worker.agence_id,
          date_embauche: worker.date_embauche || '',
          notes: worker.notes || '',
          actif: worker.actif
        });
      } else {
        // Create mode
        setFormData({
          nom: '',
          prenom: '',
          telephone: '',
          email: '',
          specialite: '',
          niveau_competence: 'Intermédiaire',
          agence_id: agencies[0]?.id || 1,
          date_embauche: '',
          notes: '',
          actif: true
        });
      }
      setError(null);
      setValidationErrors({});
    }
  }, [isOpen, worker, agencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs de saisie');
      return;
    }

    setSubmitting(true);

    try {
      if (worker) {
        // Update existing worker
        await updateWorker(worker.id, formData);
        onSuccess(`${formData.prenom} ${formData.nom} mis à jour avec succès`);
      } else {
        // Create new worker
        await createWorker(formData);
        onSuccess(`${formData.prenom} ${formData.nom} créé avec succès`);
      }
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldBlur = (field: keyof ValidationErrors) => {
    const errors = { ...validationErrors };
    
    let error: string | undefined;
    
    switch (field) {
      case 'prenom':
        error = validateName(formData.prenom);
        if (error) errors.prenom = error as string;
        else delete errors.prenom;
        break;
      case 'nom':
        error = validateName(formData.nom);
        if (error) errors.nom = error as string;
        else delete errors.nom;
        break;
      case 'telephone':
        error = validatePhone(formData.telephone);
        if (error) errors.telephone = error as string;
        else delete errors.telephone;
        break;
      case 'email':
        error = validateEmail(formData.email);
        if (error) errors.email = error as string;
        else delete errors.email;
        break;
      case 'date_embauche':
        error = validateDateEmbauche(formData.date_embauche);
        if (error) errors.date_embauche = error as string;
        else delete errors.date_embauche;
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {worker ? 'Modifier l\'ouvrier' : 'Nouvel ouvrier'}
            </h2>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                onBlur={() => handleFieldBlur('prenom')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.prenom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {validationErrors.prenom && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors.prenom}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                onBlur={() => handleFieldBlur('nom')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.nom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {validationErrors.nom && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors.nom}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                onBlur={() => handleFieldBlur('telephone')}
                placeholder="+216 XX XXX XXX"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.telephone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {validationErrors.telephone && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors.telephone}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleFieldBlur('email')}
                placeholder="ouvrier@example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spécialité
              </label>
              <input
                type="text"
                value={formData.specialite}
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                placeholder="Mécanique, Électricité, Carrosserie..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau de compétence
              </label>
              <select
                value={formData.niveau_competence}
                onChange={(e) => setFormData({ ...formData, niveau_competence: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agence *
              </label>
              <select
                required
                value={formData.agence_id}
                onChange={(e) => setFormData({ ...formData, agence_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>{agency.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'embauche
              </label>
              <input
                type="date"
                value={formData.date_embauche}
                onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                onBlur={() => handleFieldBlur('date_embauche')}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.date_embauche ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {validationErrors.date_embauche && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors.date_embauche}
                </p>
              )}
            </div>
          </div>

          {worker && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={submitting}
                />
                <span className="text-sm font-medium text-gray-700">Ouvrier actif</span>
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes additionnelles sur l'ouvrier..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {worker ? 'Mettre à jour' : 'Créer l\'ouvrier'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}