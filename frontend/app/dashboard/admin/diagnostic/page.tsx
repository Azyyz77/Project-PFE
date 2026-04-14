'use client';

import { useState, useEffect } from 'react';
import { diagnosticApi, DiagnosticProblem } from '@/lib/api/diagnostic';

export default function DiagnosticAdminPage() {
  const [problems, setProblems] = useState<DiagnosticProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<DiagnosticProblem | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: '',
    actif: true,
  });

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await diagnosticApi.getAllProblems();
      setProblems(response.data || response || []);
    } catch (error) {
      console.error('Erreur:', error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProblem) {
        await diagnosticApi.updateProblem(editingProblem.id, formData);
      } else {
        await diagnosticApi.createProblem(formData);
      }
      setShowModal(false);
      resetForm();
      loadProblems();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce problème ?')) {
      try {
        await diagnosticApi.deleteProblem(id);
        loadProblems();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', description: '', categorie: '', actif: true });
    setEditingProblem(null);
  };

  const openEditModal = (problem: DiagnosticProblem) => {
    setEditingProblem(problem);
    setFormData({
      nom: problem.nom,
      description: problem.description || '',
      categorie: problem.categorie || '',
      actif: problem.actif,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Problèmes (Diagnostic)</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          + Nouveau Problème
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-300">Chargement...</div>
      ) : (
        <div className="bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {problems.map(problem => (
                <tr key={problem.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">{problem.nom}</td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{problem.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{problem.categorie || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${problem.actif ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                      {problem.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => openEditModal(problem)} className="text-cyan-400 hover:text-cyan-300 mr-4">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(problem.id)} className="text-red-400 hover:text-red-300">
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
              {editingProblem ? 'Modifier' : 'Nouveau'} Problème
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Catégorie</label>
                  <input
                    type="text"
                    placeholder="Ex: Moteur, Freins, Électrique"
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="actif" className="text-sm font-medium text-slate-300">Actif</label>
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
                  {editingProblem ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
