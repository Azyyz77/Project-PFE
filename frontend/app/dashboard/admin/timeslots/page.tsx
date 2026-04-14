'use client';

import { useState, useEffect } from 'react';
import { timeslotsApi, TimeSlot } from '@/lib/api/timeslots';

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
      } else {
        await timeslotsApi.createTimeSlot(formData);
      }
      setShowModal(false);
      resetForm();
      loadTimeSlots();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette plage horaire ?')) {
      try {
        await timeslotsApi.deleteTimeSlot(id);
        loadTimeSlots();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ agence_id: 0, jour_semaine: 1, heure_ouverture: '', heure_fermeture: '', capacite: 1 });
    setEditingSlot(null);
  };

  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      agence_id: slot.agence_id,
      jour_semaine: slot.jour_semaine,
      heure_ouverture: slot.heure_ouverture,
      heure_fermeture: slot.heure_fermeture,
      capacite: slot.capacite,
    });
    setShowModal(true);
  };

  const getDayName = (day: number) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[day] || day;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Plages Horaires</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          + Nouvelle Plage
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-300">Chargement...</div>
      ) : timeSlots.length === 0 ? (
        <div className="bg-slate-900 rounded-lg shadow border border-slate-800 p-8 text-center">
          <p className="text-slate-400">Aucune plage horaire trouvée. Créez-en une nouvelle.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Agence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Jour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Horaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Capacité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {timeSlots.map(slot => (
                <tr key={slot.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">Agence #{slot.agence_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{getDayName(slot.jour_semaine)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">{slot.heure_ouverture} - {slot.heure_fermeture}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{slot.capacite}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => openEditModal(slot)} className="text-cyan-400 hover:text-cyan-300 mr-4">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(slot.id)} className="text-red-400 hover:text-red-300">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border border-slate-800">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">
              {editingSlot ? 'Modifier' : 'Nouvelle'} Plage Horaire
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Agence ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.agence_id}
                    onChange={(e) => setFormData({ ...formData, agence_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Jour de la semaine *</label>
                  <select
                    required
                    value={formData.jour_semaine}
                    onChange={(e) => setFormData({ ...formData, jour_semaine: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
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
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Heure ouverture *</label>
                  <input
                    type="time"
                    required
                    value={formData.heure_ouverture}
                    onChange={(e) => setFormData({ ...formData, heure_ouverture: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Heure fermeture *</label>
                  <input
                    type="time"
                    required
                    value={formData.heure_fermeture}
                    onChange={(e) => setFormData({ ...formData, heure_fermeture: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Capacité *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacite}
                    onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  {editingSlot ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
