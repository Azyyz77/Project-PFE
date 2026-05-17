'use client';

import { useState, useEffect } from 'react';
import { packagesApi, Package } from '@/lib/api/packages';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowLeft, Loader2, Package as PackageIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PackagesAdminPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: 0,
    duree_estimee: '',
    actif: true,
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await packagesApi.getAllPackages();
      setPackages(response || []);
    } catch (error) {
      console.error('Erreur:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        sous_types: [] // Tableau vide pour l'instant
      };
      
      if (editingPackage) {
        await packagesApi.updatePackage(editingPackage.id, dataToSend);
        toast.success('Package mis à jour');
      } else {
        await packagesApi.createPackage(dataToSend);
        toast.success('Package créé');
      }
      setShowModal(false);
      resetForm();
      loadPackages();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce package de prestations ?')) {
      try {
        await packagesApi.deletePackage(id);
        toast.success('Package supprimé');
        loadPackages();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', description: '', prix: 0, duree_estimee: '', actif: true });
    setEditingPackage(null);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      nom: pkg.nom,
      description: pkg.description || '',
      prix: pkg.prix,
      duree_estimee: pkg.duree_estimee || '',
      actif: pkg.actif,
    });
    setShowModal(true);
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
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <PackageIcon className="w-7 h-7 text-orange-500" />
            Gestion des Packages SAV
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gérez le catalogue des forfaits d'interventions récurrentes avec tarifs préférentiels.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau forfait
        </Button>
      </div>

      {/* Main Packages Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {packages.length === 0 ? (
          <div className="p-16 text-center">
            <PackageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucun forfait configuré pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Forfait</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tarif fixe</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durée estimée</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{pkg.nom}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium max-w-xs truncate">{pkg.description || <span className="text-slate-400 font-normal">-</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-slate-900">{pkg.prix} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-semibold">{pkg.duree_estimee || <span className="text-slate-400 font-normal">-</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          pkg.actif
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pkg.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(pkg)}
                          className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pkg.id)}
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

      {/* Package Creation/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
              {editingPackage ? 'Modifier le package' : 'Ajouter un nouveau package'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom du package *</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: Entretien Annuel..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Détaillez les prestations incluses dans ce forfait..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Tarif forfaitaire (TND) *</label>
                <input
                  type="number"
                  required
                  value={formData.prix || 0}
                  onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: 150"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Durée estimée de l'intervention</label>
                <input
                  type="text"
                  placeholder="Ex: 2h30"
                  value={formData.duree_estimee}
                  onChange={(e) => setFormData({ ...formData, duree_estimee: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="actif" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Forfait actif et disponible à la commande
                </label>
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
