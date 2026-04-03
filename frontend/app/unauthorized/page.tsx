'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const redirectMap: Record<string, string> = {
    CLIENT: '/client/dashboard',
    AGENT: '/dashboard/agent',
    ADMIN: '/dashboard/admin',
    DIRECTION: '/dashboard/direction',
  };

  const handleRedirect = () => {
    const redirectUrl = user?.role ? redirectMap[user.role] : '/login';
    router.replace(redirectUrl);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <Shield className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Accès refusé</h1>

          {/* Message */}
          <p className="text-gray-600 mb-8">
            Vous n'avez pas les droits pour accéder à cette page. Votre rôle actuel ne vous
            autorise pas à consulter ce contenu.
          </p>

          {/* User Info */}
          {user && (
            <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Utilisateur:</strong> {user.prenom} {user.nom}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Rôle:</strong> {user.role}
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleRedirect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à mon tableau de bord
          </Button>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-6">
            Si vous pensez que c'est une erreur, veuillez contacter l'administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}
