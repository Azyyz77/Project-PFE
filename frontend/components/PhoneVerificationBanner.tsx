'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, X } from 'lucide-react';

export function PhoneVerificationBanner() {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Ne pas afficher si l'utilisateur n'est pas connecté, n'est pas un client, ou a déjà vérifié son téléphone
  if (!user || user.role !== 'CLIENT' || user.telephone_verifie || isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <h4 className="font-semibold">Vérification téléphonique requise</h4>
          <p className="text-sm mt-1">
            Vous devez vérifier votre numéro de téléphone pour pouvoir prendre des rendez-vous et accéder à tous les services.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Link href="/verify-phone">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Phone className="mr-2 h-4 w-4" />
              Vérifier maintenant
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}