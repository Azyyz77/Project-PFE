'use client';

import { useState } from 'react';
import {
  Edit, CheckCircle, XCircle, Building2, Phone, Mail,
  Award, Clock, AlertTriangle, User
} from 'lucide-react';
import { Worker, deactivateWorker, activateWorker } from '@/lib/api/workers';

interface WorkerCardProps {
  worker: Worker;
  onEdit: (worker: Worker) => void;
  onStatusChange: (message: string) => void;
  onError: (error: string) => void;
}

export default function WorkerCard({ worker, onEdit, onStatusChange, onError }: WorkerCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    try {
      if (worker.actif) {
        await deactivateWorker(worker.id);
        onStatusChange(`${worker.prenom} ${worker.nom} désactivé avec succès`);
      } else {
        await activateWorker(worker.id);
        onStatusChange(`${worker.prenom} ${worker.nom} activé avec succès`);
      }
    } catch (e: any) {
      onError(e?.response?.data?.message || e?.message || 'Erreur lors du changement de statut');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
            {worker.prenom[0]}{worker.nom[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{worker.prenom} {worker.nom}</h3>
            <p className="text-sm text-gray-500">{worker.specialite || 'Généraliste'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {worker.actif ? (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 font-medium">Actif</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs text-red-700 font-medium">Inactif</span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{worker.agence_nom || `Agence ${worker.agence_id}`}</span>
        </div>
        
        {worker.telephone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{worker.telephone}</span>
          </div>
        )}
        
        {worker.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="truncate">{worker.email}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Award className="w-4 h-4 text-gray-400" />
          <span>{worker.niveau_competence || 'Intermédiaire'}</span>
        </div>
        
        {worker.affectations_en_cours !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              {worker.affectations_en_cours} affectation{worker.affectations_en_cours > 1 ? 's' : ''} en cours
            </span>
          </div>
        )}

        {worker.date_embauche && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>
              Embauché le {new Date(worker.date_embauche).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {worker.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 italic">"{worker.notes}"</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(worker)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </button>
        
        <button
          onClick={handleToggleStatus}
          disabled={isUpdating}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
            worker.actif
              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
          }`}
        >
          {isUpdating ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : worker.actif ? (
            <>
              <XCircle className="w-4 h-4" />
              Désactiver
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Activer
            </>
          )}
        </button>
      </div>

      {/* Workload indicator */}
      {worker.actif && worker.affectations_en_cours !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Charge de travail</span>
            <span>{worker.affectations_en_cours}/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                worker.affectations_en_cours === 0
                  ? 'bg-green-500'
                  : worker.affectations_en_cours <= 2
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((worker.affectations_en_cours / 5) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}