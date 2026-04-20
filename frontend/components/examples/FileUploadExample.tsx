'use client';

import React, { useState } from 'react';
import FileUpload from '../FileUpload';
import AttachmentsList from '../AttachmentsList';

interface FileUploadExampleProps {
  entiteType: string;
  entiteId: number;
  title?: string;
}

export default function FileUploadExample({
  entiteType,
  entiteId,
  title = 'Gestion des pièces jointes'
}: FileUploadExampleProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gérer le succès d'upload
  const handleUploadSuccess = (files: any[]) => {
    setMessage({
      type: 'success',
      text: `${files.length} fichier(s) uploadé(s) avec succès`
    });
    setRefreshKey(prev => prev + 1); // Force le refresh de la liste
    
    // Effacer le message après 5 secondes
    setTimeout(() => setMessage(null), 5000);
  };

  // Gérer les erreurs d'upload
  const handleUploadError = (error: string) => {
    setMessage({
      type: 'error',
      text: error
    });
    
    // Effacer le message après 5 secondes
    setTimeout(() => setMessage(null), 5000);
  };

  // Gérer la suppression d'une pièce jointe
  const handleAttachmentDeleted = () => {
    setMessage({
      type: 'success',
      text: 'Pièce jointe supprimée avec succès'
    });
    setRefreshKey(prev => prev + 1); // Force le refresh de la liste
    
    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Uploadez et gérez les fichiers associés à cette entité
        </p>
      </div>

      {/* Messages de feedback */}
      {message && (
        <div className={`
          p-4 rounded-lg border
          ${message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
          }
        `}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Composant d'upload */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Ajouter des fichiers</h4>
        <FileUpload
          entiteType={entiteType}
          entiteId={entiteId}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          maxFiles={5}
        />
      </div>

      {/* Liste des pièces jointes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Pièces jointes existantes</h4>
        <AttachmentsList
          key={refreshKey} // Force le refresh quand refreshKey change
          entiteType={entiteType}
          entiteId={entiteId}
          onAttachmentDeleted={handleAttachmentDeleted}
        />
      </div>

      {/* Informations d'aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Informations importantes</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Taille maximum par fichier: 10MB</li>
          <li>• Maximum 5 fichiers par upload</li>
          <li>• Types autorisés: Images, PDF, Word, Excel, Texte</li>
          <li>• Les fichiers sont stockés de manière sécurisée</li>
        </ul>
      </div>
    </div>
  );
}

// Exemples d'utilisation pour différents types d'entités
export const AppointmentAttachments = ({ appointmentId }: { appointmentId: number }) => (
  <FileUploadExample
    entiteType="RDV"
    entiteId={appointmentId}
    title="Pièces jointes du rendez-vous"
  />
);

export const ComplaintAttachments = ({ complaintId }: { complaintId: number }) => (
  <FileUploadExample
    entiteType="RECLAMATION"
    entiteId={complaintId}
    title="Preuves de la réclamation"
  />
);