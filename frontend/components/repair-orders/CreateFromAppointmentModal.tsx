'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { repairOrdersApi } from '@/lib/api/repairOrders';
import { Button } from '@/components/ui/button';
import { X, Calendar, User, Car, Clock } from 'lucide-react';

interface Appointment {
  id: number;
  date_heure: string;
  statut: string;
  client_nom: string;
  client_prenom: string;
  vehicule_immatriculation: string;
  vehicule_marque: string;
  vehicule_modele: string;
}

interface CreateFromAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFromAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFromAppointmentModalProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      loadAppointments();
    }
  }, [isOpen, token]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      // Utiliser l'endpoint agent-dashboard pour récupérer tous les RDV de l'agence
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/agent-dashboard/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des rendez-vous');
      }
      
      const data = await response.json();
      console.log('Rendez-vous chargés:', data);
      
      // Filtrer les RDV confirmés ou terminés qui n'ont pas encore de commande
      const allAppointments = data.appointments || data.data || data;
      const validAppointments = allAppointments.filter(
        (apt: any) => ['CONFIRME', 'TERMINE'].includes(apt.statut)
      );
      
      console.log('Rendez-vous valides:', validAppointments);
      setAppointments(validAppointments);
    } catch (err: any) {
      console.error('Erreur chargement RDV:', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedAppointment) return;

    try {
      setCreating(true);
      setError(null);
      await repairOrdersApi.createFromAppointment(selectedAppointment);
      
      // Fermer le modal et recharger la liste
      onSuccess();
      onClose();
      
      // Recharger la page pour voir la nouvelle commande
      window.location.reload();
    } catch (err: any) {
      console.error('Erreur création commande:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création de la commande');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Créer une Commande</h2>
            <p className="text-slate-400 mt-1">Sélectionnez un rendez-vous pour créer une commande de réparation</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Chargement des rendez-vous...
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
              <Button
                onClick={loadAppointments}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Réessayer
              </Button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg">Aucun rendez-vous disponible</p>
              <p className="text-sm mt-2">Les rendez-vous doivent être confirmés ou terminés</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => setSelectedAppointment(appointment.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAppointment === appointment.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date et statut */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {new Date(appointment.date_heure).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-slate-400 text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(appointment.date_heure).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          appointment.statut === 'CONFIRME' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {appointment.statut}
                        </span>
                      </div>
                    </div>

                    {/* Client */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Client</p>
                        <p className="text-white font-medium">
                          {appointment.client_prenom} {appointment.client_nom}
                        </p>
                      </div>
                    </div>

                    {/* Véhicule */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <Car className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Véhicule</p>
                        <p className="text-white font-medium">{appointment.vehicule_immatriculation}</p>
                        <p className="text-slate-400 text-sm">
                          {appointment.vehicule_marque} {appointment.vehicule_modele}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedAppointment || creating}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Création...' : 'Créer la Commande'}
          </Button>
        </div>
      </div>
    </div>
  );
}
