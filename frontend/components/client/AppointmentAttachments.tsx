'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';
import AttachmentsList from '@/components/AttachmentsList';
import { FileText, Upload, X } from 'lucide-react';

interface AppointmentAttachmentsProps {
  appointmentId: number;
  isReadOnly?: boolean;
  className?: string;
}

export default function AppointmentAttachments({
  appointmentId,
  isReadOnly = false,
  className = ''
}: AppointmentAttachmentsProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gérer le succès d'upload
  const handleUploadSuccess = (files: any[]) => {
    setMessage({
      type: 'success',
      text: `${files.length} fichier(s) ajouté(s) avec succès`
    });
    setRefreshKey(prev => prev + 1);
    setShowUpload(false);
    
    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(null), 3000);
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
      text: 'Document supprimé avec succès'
    });
    setRefreshKey(prev => prev + 1);
    
    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Documents du rendez-vous</CardTitle>
          </div>
          
          {!isReadOnly && (
            <Button
              onClick={() => setShowUpload(!showUpload)}
              variant={showUpload ? "outline" : "default"}
              size="sm"
              className="flex items-center space-x-2"
            >
              {showUpload ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Ajouter</span>
                </>
              )}
            </Button>
          )}
        </div>
        
        <p className="text-sm text-gray-600">
          Ajoutez des photos, documents ou preuves liés à ce rendez-vous
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Messages de feedback */}
        {message && (
          <div className={`
            p-3 rounded-lg border text-sm
            ${message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
            }
          `}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Zone d'upload (conditionnelle) */}
        {showUpload && !isReadOnly && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <FileUpload
              entiteType="RDV"
              entiteId={appointmentId}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              maxFiles={3}
            />
          </div>
        )}

        {/* Liste des pièces jointes */}
        <AttachmentsList
          key={refreshKey}
          entiteType="RDV"
          entiteId={appointmentId}
          onAttachmentDeleted={handleAttachmentDeleted}
        />

        {/* Informations d'aide */}
        {!isReadOnly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Types de documents utiles :</p>
                <ul className="text-xs space-y-0.5">
                  <li>• Photos du problème ou des dégâts</li>
                  <li>• Documents de garantie</li>
                  <li>• Factures d'achat ou de réparation</li>
                  <li>• Rapports d'expertise</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Composant pour afficher les pièces jointes en mode compact
export function AppointmentAttachmentsCompact({
  appointmentId,
  className = ''
}: {
  appointmentId: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <FileText className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Documents</span>
      </div>
      
      <AttachmentsList
        entiteType="RDV"
        entiteId={appointmentId}
        className="max-h-40 overflow-y-auto"
      />
    </div>
  );
}