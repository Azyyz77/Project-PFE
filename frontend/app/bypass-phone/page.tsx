'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BypassPhonePage() {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState('');

  const bypassVerification = () => {
    // Créer un token temporaire avec telephone_verifie = true
    if (user) {
      const fakeToken = btoa(JSON.stringify({
        header: { alg: 'HS256', typ: 'JWT' }
      })) + '.' + 
      btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        telephone_verifie: true,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
      })) + '.fake-signature';

      // Mettre à jour le localStorage et les cookies
      localStorage.setItem('token', fakeToken);
      
      const updatedUser = { ...user, telephone_verifie: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      document.cookie = `token=${fakeToken}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
      
      setMessage('Vérification téléphonique contournée temporairement');
      
      setTimeout(() => {
        window.location.href = '/client/dashboard';
      }, 2000);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    setMessage('Authentification effacée');
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Contournement Temporaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <div>
              <p className="font-semibold">Mode Débogage</p>
              <p className="text-sm">
                Cette page permet de contourner temporairement la vérification téléphonique 
                pour déboguer le système.
              </p>
            </div>
          </Alert>

          {user && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
              <p className="text-sm font-medium">Utilisateur connecté:</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
              <p className="text-xs">
                Téléphone vérifié: {user.telephone_verifie ? 'Oui' : 'Non'}
              </p>
            </div>
          )}

          {message && (
            <Alert className="border-green-200 bg-green-50 text-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm">{message}</p>
            </Alert>
          )}

          <div className="space-y-2">
            <Button 
              onClick={bypassVerification} 
              className="w-full"
              disabled={!user}
            >
              Contourner la vérification
            </Button>
            
            <Button 
              onClick={clearAuth} 
              variant="outline" 
              className="w-full"
            >
              Effacer l'authentification
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/debug-auth'} 
              variant="ghost" 
              className="w-full"
            >
              Voir le débogage complet
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            <p>⚠️ À utiliser uniquement en développement</p>
            <p>Le token généré ne sera pas valide côté serveur</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}