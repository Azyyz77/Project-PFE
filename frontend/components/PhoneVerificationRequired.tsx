'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle } from 'lucide-react';

interface PhoneVerificationRequiredProps {
  children: React.ReactNode;
  message?: string;
}

export function PhoneVerificationRequired({ 
  children, 
  message = "Cette fonctionnalité nécessite la vérification de votre numéro de téléphone." 
}: PhoneVerificationRequiredProps) {
  const { user } = useAuth();

  // Si l'utilisateur n'est pas un client ou a déjà vérifié son téléphone, afficher le contenu
  if (!user || user.role !== 'CLIENT' || user.telephone_verifie) {
    return <>{children}</>;
  }

  // Sinon, afficher le message de vérification requise
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
          <Phone className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Vérification téléphonique requise
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {message}
          </p>
        </div>

        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <p className="text-sm">
            Pour des raisons de sécurité et pour vous contacter en cas de besoin, 
            nous devons vérifier votre numéro de téléphone.
          </p>
        </Alert>

        <Link href="/verify-phone">
          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            <Phone className="mr-2 h-4 w-4" />
            Vérifier mon téléphone
          </Button>
        </Link>
      </div>
    </div>
  );
}