'use client';

import React, { useState, useRef, useCallback } from 'react';
import { uploadFile, validateFile, formatFileSize, getFileIcon } from '@/lib/api/attachments';

interface FileUploadProps {
  entiteType: string;
  entiteId: number;
  onUploadSuccess?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  progress?: number;
  error?: string;
}

export default function FileUpload({
  entiteType,
  entiteId,
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  className = ''
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Générer un ID unique pour chaque fichier
  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  // Créer une preview pour les images
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  // Ajouter des fichiers
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Vérifier le nombre maximum de fichiers
    if (files.length + fileArray.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    const validFiles: FileWithPreview[] = [];

    for (const file of fileArray) {
      // Valider le fichier
      const validation = validateFile(file);
      if (!validation.valid) {
        onUploadError?.(validation.error || 'Fichier invalide');
        continue;
      }

      // Créer l'objet fichier avec preview
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id: generateFileId(),
        preview: await createPreview(file),
        progress: 0
      });

      validFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length, maxFiles, onUploadError]);

  // Supprimer un fichier
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Gérer le drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Ouvrir le sélecteur de fichiers
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Upload des fichiers
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Mettre à jour le progrès
      const updateProgress = (progress: number) => {
        setFiles(prev => prev.map(f => ({ ...f, progress })));
      };

      const result = await uploadFile(files, entiteType, entiteId, updateProgress);
      
      if (result.success) {
        onUploadSuccess?.(result.files);
        setFiles([]); // Vider la liste après upload réussi
      } else {
        onUploadError?.(result.message || 'Erreur lors de l\'upload');
      }
    } catch (error: any) {
      console.error('Erreur upload:', error);
      onUploadError?.(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`file-upload ${className}`}>
      {/* Zone de drop */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="flex flex-col items-center space-y-2">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Glissez vos fichiers ici ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">
              Maximum {maxFiles} fichiers, 10MB par fichier
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Images, PDF, Word, Excel, Texte
            </p>
          </div>
        </div>
      </div>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Liste des fichiers sélectionnés */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-700">Fichiers sélectionnés:</h4>
          {files.map((file) => (
            <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {/* Preview ou icône */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img 
                    src={file.preview} 
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl">
                    {getFileIcon(file.type)}
                  </div>
                )}
              </div>

              {/* Infos fichier */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                
                {/* Barre de progression */}
                {isUploading && (
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton supprimer */}
              {!isUploading && (
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Bouton d'upload */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${isUploading || files.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {isUploading ? 'Upload en cours...' : `Uploader ${files.length} fichier(s)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}