'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Worker, assignWorkerToAppointment } from '@/lib/api/workers';

interface Appointment {
  id: number;
  date_heure: string;
  client_nom: string;
  client_prenom: string;
  vehicule_immatriculation: string;
  vehicule_marque: string;
  vehicule_modele: string;
  statut: string;
  type_intervention?: string;
}

interface AssignWorkerModalProps {
  worker: Worker;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignWorkerModal({ worker, onClose, onSuccess }: AssignWorkerModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser la fonction API au lieu de fetch direct
      const { getUnassignedAppointments } = await import('@/lib/api/workers');
      const data = await getUnassignedAppointments(worker.agence_id);
      
      setAppointments(data || []);
    } catch (err: any) {
      console.error('Erreur chargement RDV:', err);
      setError(err.message || 'Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAppointment) {
      setError('Veuillez sélectionner un rendez-vous');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await assignWorkerToAppointment({
        rendez_vous_id: selectedAppointment,
        ouvrier_id: worker.id,
        notes_agent: notes || undefined
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Erreur affectation:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'affectation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#E30613] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Affecter un Ouvrier</h2>
            <p className="text-sm opacity-90">
              {worker.prenom} {worker.nom} - {worker.specialite}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Affectation réussie!
              </h3>
              <p className="text-gray-600">
                L'ouvrier a été affecté au rendez-vous avec succès.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Erreur</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Sélection Rendez-vous */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Sélectionner un rendez-vous *
                </label>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E30613] mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Chargement des rendez-vous...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Aucun rendez-vous disponible</p>
                    <p className="text-sm text-gray-500">
                      Tous les rendez-vous sont déjà affectés
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {appointments.map((apt) => (
                      <label
                        key={apt.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAppointment === apt.id
                            ? 'border-[#E30613] bg-red-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="appointment"
                          value={apt.id}
                          checked={selectedAppointment === apt.id}
                          onChange={() => setSelectedAppointment(apt.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                {apt.client_prenom} {apt.client_nom}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                📅 {new Date(apt.date_heure).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div>
                                🚗 {apt.vehicule_marque} {apt.vehicule_modele} - {apt.vehicule_immatriculation}
                              </div>
                              {apt.type_intervention && (
                                <div>🔧 {apt.type_intervention}</div>
                              )}
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {apt.statut}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes pour l'ouvrier (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E30613] focus:border-transparent"
                  placeholder="Instructions spéciales, points d'attention..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedAppointment || appointments.length === 0}
                  className="flex-1 px-4 py-2 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510] font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Affectation...' : 'Affecter l\'ouvrier'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
