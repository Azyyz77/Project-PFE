'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '@/components/FileUpload';
import AttachmentsList from '@/components/AttachmentsList';
import { AppointmentAttachments, ComplaintAttachments } from '@/components/examples/FileUploadExample';
import { FileText, Upload, Users, MessageSquare, Calendar } from 'lucide-react';

export default function FileUploadDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<'basic' | 'appointment' | 'complaint'>('basic');
  const [demoEntityId, setDemoEntityId] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-full">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Système de Gestion de Fichiers
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Démonstration complète du système d&apos;upload et de gestion des pièces jointes
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="bg-green-600 text-white">
              ✅ Backend Ready
            </Badge>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              ✅ Frontend Ready
            </Badge>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              ✅ Database Ready
            </Badge>
          </div>
        </div>

        {/* Demo Selector */}
        <Card className="bg-[#F0F2F5] border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Choisir une démonstration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={selectedDemo === 'basic' ? 'default' : 'outline'}
                onClick={() => setSelectedDemo('basic')}
                className="h-20 flex flex-col space-y-2"
              >
                <FileText className="w-6 h-6" />
                <span>Upload Basique</span>
              </Button>
              
              <Button
                variant={selectedDemo === 'appointment' ? 'default' : 'outline'}
                onClick={() => setSelectedDemo('appointment')}
                className="h-20 flex flex-col space-y-2"
              >
                <Calendar className="w-6 h-6" />
                <span>Rendez-vous</span>
              </Button>
              
              <Button
                variant={selectedDemo === 'complaint' ? 'default' : 'outline'}
                onClick={() => setSelectedDemo('complaint')}
                className="h-20 flex flex-col space-y-2"
              >
                <MessageSquare className="w-6 h-6" />
                <span>Réclamations</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Demo */}
          <Card className="bg-[#F0F2F5] border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedDemo === 'basic' && 'Upload Basique'}
                {selectedDemo === 'appointment' && 'Documents de Rendez-vous'}
                {selectedDemo === 'complaint' && 'Preuves de Réclamation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDemo === 'basic' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-white">ID d&apos;entité de test:</label>
                    <input
                      type="number"
                      value={demoEntityId}
                      onChange={(e) => setDemoEntityId(parseInt(e.target.value) || 1)}
                      className="px-3 py-1 bg-slate-700 text-white rounded border border-slate-600"
                      min="1"
                    />
                  </div>
                  
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload</TabsTrigger>
                      <TabsTrigger value="list">Liste</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <FileUpload
                        entiteType="RDV"
                        entiteId={demoEntityId}
                        onUploadSuccess={(files) => {
                          console.log('Upload réussi:', files);
                          alert(`${files.length} fichier(s) uploadé(s) avec succès!`);
                        }}
                        onUploadError={(error) => {
                          console.error('Erreur upload:', error);
                          alert(`Erreur: ${error}`);
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="list" className="space-y-4">
                      <AttachmentsList
                        entiteType="RDV"
                        entiteId={demoEntityId}
                        onAttachmentDeleted={() => {
                          console.log('Fichier supprimé');
                          alert('Fichier supprimé avec succès!');
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {selectedDemo === 'appointment' && (
                <AppointmentAttachments appointmentId={demoEntityId} />
              )}

              {selectedDemo === 'complaint' && (
                <ComplaintAttachments complaintId={demoEntityId} />
              )}
            </CardContent>
          </Card>

          {/* Right Column - Info */}
          <Card className="bg-[#F0F2F5] border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Informations Techniques</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
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
                  <li>• Maximum: 5 fichiers par upload</li>
                  <li>• Types d&apos;entités: RDV, RECLAMATION</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Fonctionnalités:</h3>
                <ul className="text-sm space-y-1">
                  <li>✅ Drag & Drop</li>
                  <li>✅ Preview des images</li>
                  <li>✅ Barre de progression</li>
                  <li>✅ Validation côté client</li>
                  <li>✅ Téléchargement sécurisé</li>
                  <li>✅ Suppression avec confirmation</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">API Endpoints:</h3>
                <div className="text-xs space-y-1 font-mono bg-white p-3 rounded">
                  <div>POST /api/attachments/upload</div>
                  <div>GET /api/attachments/:type/:id</div>
                  <div>DELETE /api/attachments/:id</div>
                  <div>GET /api/attachments/:id/download</div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                <h4 className="font-semibold text-blue-300 mb-1">💡 Conseil</h4>
                <p className="text-sm text-blue-200">
                  Utilisez les composants prêts à l&apos;emploi dans vos pages existantes pour une intégration rapide.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Examples */}
        <Card className="bg-[#F0F2F5] border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Exemples d&apos;intégration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basique</TabsTrigger>
                <TabsTrigger value="appointment">Rendez-vous</TabsTrigger>
                <TabsTrigger value="complaint">Réclamation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <pre className="bg-white p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`import FileUpload from '@/components/FileUpload';

<FileUpload
  entiteType="RDV"
  entiteId={123}
  onUploadSuccess={(files) => console.log('Success:', files)}
  onUploadError={(error) => console.error('Error:', error)}
/>`}
                </pre>
              </TabsContent>
              
              <TabsContent value="appointment" className="space-y-4">
                <pre className="bg-white p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`import AppointmentAttachments from '@/components/client/AppointmentAttachments';

<AppointmentAttachments 
  appointmentId={appointmentId}
  isReadOnly={appointment.status === 'TERMINE'}
/>`}
                </pre>
              </TabsContent>
              
              <TabsContent value="complaint" className="space-y-4">
                <pre className="bg-white p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`import { ComplaintAttachments } from '@/components/examples/FileUploadExample';

<ComplaintAttachments complaintId={complaintId} />`}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}