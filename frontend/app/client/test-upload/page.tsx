'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUpload from '@/components/FileUpload';
import AttachmentsList from '@/components/AttachmentsList';
import DebugAuth from '@/components/DebugAuth';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function TestUploadPage() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'success' | 'error' | 'warning';
    message: string;
  }>>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const addTestResult = (test: string, status: 'success' | 'error' | 'warning', message: string) => {
    setTestResults(prev => [...prev, { test, status, message }]);
  };

  const handleUploadSuccess = (files: any[]) => {
    addTestResult('Upload', 'success', `${files.length} fichier(s) uploadé(s) avec succès`);
    setRefreshKey(prev => prev + 1);
  };

  const handleUploadError = (error: string) => {
    addTestResult('Upload', 'error', `Erreur: ${error}`);
  };

  const handleAttachmentDeleted = () => {
    addTestResult('Delete', 'success', 'Fichier supprimé avec succès');
    setRefreshKey(prev => prev + 1);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getAlertVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">
            Test de Upload de Fichiers
          </h1>
          <p className="text-slate-300">
            Page de test pour vérifier le fonctionnement du système d'upload
          </p>
        </div>

        {/* Debug Authentication */}
        <DebugAuth />

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Résultats des Tests</CardTitle>
              <Button onClick={clearResults} variant="outline" size="sm">
                Effacer
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {testResults.map((result, index) => (
                <Alert key={index} variant={getAlertVariant(result.status)} className="flex items-center space-x-2">
                  {getIcon(result.status)}
                  <AlertDescription className="flex-1">
                    <strong>{result.test}:</strong> {result.message}
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upload Test */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Test d'Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              entiteType="RDV"
              entiteId={999} // ID de test
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              maxFiles={3}
            />
          </CardContent>
        </Card>

        {/* Attachments List Test */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Liste des Pièces Jointes</CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentsList
              key={refreshKey}
              entiteType="RDV"
              entiteId={999} // ID de test
              onAttachmentDeleted={handleAttachmentDeleted}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Instructions de Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Comment tester:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Sélectionnez ou glissez-déposez des fichiers dans la zone d'upload</li>
                <li>Cliquez sur "Uploader" pour envoyer les fichiers</li>
                <li>Vérifiez que les fichiers apparaissent dans la liste</li>
                <li>Testez le téléchargement en cliquant sur l'icône de téléchargement</li>
                <li>Testez la suppression en cliquant sur l'icône de suppression</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Types de fichiers supportés:</h3>
              <ul className="text-sm space-y-1">
                <li>📷 Images: JPEG, PNG, GIF, WebP</li>
                <li>📄 Documents: PDF, Word, Excel</li>
                <li>📝 Texte: TXT, CSV</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Limitations:</h3>
              <ul className="text-sm space-y-1">
                <li>• Taille max: 10MB par fichier</li>
                <li>• Maximum: 3 fichiers par upload (pour ce test)</li>
              </ul>
            </div>

            <Alert className="bg-blue-900/20 border-blue-800">
              <AlertTriangle className="w-4 h-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                <strong>Note:</strong> Cette page utilise l'ID d'entité 999 pour les tests. 
                Les fichiers uploadés ici sont réels et seront stockés dans la base de données.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}