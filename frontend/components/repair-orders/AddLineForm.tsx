'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CreateLineRequest } from '@/types/repairOrder';

interface Props {
  onSubmit: (line: CreateLineRequest) => Promise<void>;
  onCancel: () => void;
}

export default function AddLineForm({ onSubmit, onCancel }: Props) {
  const [type, setType] = useState<'INTERVENTION' | 'PIECE'>('INTERVENTION');
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (prixUnitaire <= 0) {
      alert('Le prix unitaire doit être supérieur à 0');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type,
        quantite,
        prix_unitaire: prixUnitaire,
      });
      // Reset form
      setQuantite(1);
      setPrixUnitaire(0);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = quantite * prixUnitaire;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-white font-semibold mb-4">Ajouter une ligne</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Type *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="INTERVENTION">Intervention (Main d'œuvre)</option>
            <option value="PIECE">Pièce détachée</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Quantité *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantite}
            onChange={(e) => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Prix unitaire (TND) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={prixUnitaire}
            onChange={(e) => setPrixUnitaire(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Total (TND)
          </label>
          <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold">
            {total.toFixed(2)} TND
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-slate-600 hover:bg-slate-800"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading || prixUnitaire <= 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter la ligne'}
        </Button>
      </div>
    </form>
  );
}
