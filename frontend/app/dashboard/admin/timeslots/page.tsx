'use client';

import { useState, useEffect } from 'react';
import { timeslotsApi, TimeSlot } from '@/lib/api/timeslots';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Edit, Trash2, ArrowLeft, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TimeSlotsAdminPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    agence_id: 0,
    jour_semaine: 1,
    heure_ouverture: '',
    heure_fermeture: '',
    capacite: 1,
  });

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      const data = await timeslotsApi.getAllTimeSlots();
      setTimeSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await timeslotsApi.updateTimeSlot(editingSlot.id, formData);
        toast.success('Plage horaire modifiée');
      } else {
        await timeslotsApi.createTimeSlot(formData);
        toast.success('Plage horaire créée');
      }
      setShowModal(false);
      resetForm();
      loadTimeSlots();
    } catch (error: any) {
      console.error('Erreur:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de l\'opération';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette plage horaire ?')) {
      try {
        await timeslotsApi.deleteTimeSlot(id);
        toast.success('Plage horaire supprimée');
        loadTimeSlots();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({ agence_id: 0, jour_semaine: 1, heure_ouverture: '', heure_fermeture: '', capacite: 1 });
    setEditingSlot(null);
  };

  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot);
    
    const frontendDayOfWeek = slot.jour_semaine === 7 ? 0 : slot.jour_semaine;
    
    const normalizeTime = (timeStr: string) => {
      if (!timeStr) return '';
      const cleaned = timeStr.trim();
      const withoutMillis = cleaned.split('.')[0];
      return withoutMillis.substring(0, 5);
    };
    
    const heureOuverture = normalizeTime(slot.heure_ouverture);
    const heureFermeture = normalizeTime(slot.heure_fermeture);
    
    setFormData({
      agence_id: slot.agence_id,
      jour_semaine: frontendDayOfWeek,
      heure_ouverture: heureOuverture,
      heure_fermeture: heureFermeture,
      capacite: slot.capacite,
    });
    setShowModal(true);
  };

  const getDayName = (day: number) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    if (day === 7) {
      return days[0]; // Sunday
    }
    return days[day] || day;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <Clock className="w-7 h-7 text-orange-500" />
            Plages Horaires SAV
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gérez le calendrier hebdomadaire d'ouverture et les capacités d'accueil par agence.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Plage
        </Button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {timeSlots.length === 0 ? (
          <div className="p-16 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucune plage horaire configurée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agence</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jour</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plage Horaire</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Capacité (véhicules)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timeSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">Agence #{slot.agence_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700 font-semibold">{getDayName(slot.jour_semaine)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-bold">
                      <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-100/50 text-xs font-bold">
                        {slot.heure_ouverture} - {slot.heure_fermeture}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-slate-700">{slot.capacite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(slot)}
                          className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(slot.id)}
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
              {editingSlot ? 'Modifier la plage horaire' : 'Nouvelle plage horaire'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">ID de l'Agence *</label>
                <input
                  type="number"
                  required
                  value={formData.agence_id}
                  onChange={(e) => setFormData({ ...formData, agence_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: 1"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Jour de la semaine *</label>
                <select
                  required
                  value={formData.jour_semaine}
                  onChange={(e) => setFormData({ ...formData, jour_semaine: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none font-semibold"
                >
                  <option value={0}>Dimanche</option>
                  <option value={1}>Lundi</option>
                  <option value={2}>Mardi</option>
                  <option value={3}>Mercredi</option>
                  <option value={4}>Jeudi</option>
                  <option value={5}>Vendredi</option>
                  <option value={6}>Samedi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Ouverture *</label>
                  <input
                    type="time"
                    required
                    value={formData.heure_ouverture}
                    onChange={(e) => setFormData({ ...formData, heure_ouverture: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Fermeture *</label>
                  <input
                    type="time"
                    required
                    value={formData.heure_fermeture}
                    onChange={(e) => setFormData({ ...formData, heure_fermeture: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Capacité d'accueil (véhicules simultanés) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacite}
                  onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: 5"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm">
                  Sauvegarder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
