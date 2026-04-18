'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resendVerificationCode, verifyPhoneNumber } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function PhoneVerificationTest() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendCode = async () => {
    if (!email) {
      setError('Email requis');
      return;
    }

    setIsResending(true);
    setMessage('');
    setError('');

    try {
      const result = await resendVerificationCode(email);
      setMessage(result.message);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!email || !otp) {
      setError('Email et code OTP requis');
      return;
    }

    setIsVerifying(true);
    setMessage('');
    setError('');

    try {
      const result = await verifyPhoneNumber(email, otp);
      setMessage(result.message);
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Test de Vérification Téléphonique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm font-medium">Utilisateur connecté:</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
            <p className="text-xs">
              Téléphone vérifié: {' '}
              <span className={user.telephone_verifie ? 'text-green-600' : 'text-red-600'}>
                {user.telephone_verifie ? 'Oui' : 'Non'}
              </span>
            </p>
          </div>
        )}

        {message && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm">{message}</p>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-900">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <Button
          onClick={handleResendCode}
          disabled={isResending || !email}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
          {isResending ? 'Envoi...' : 'Renvoyer le code'}
        </Button>

        <div className="space-y-2">
          <label className="text-sm font-medium">Code OTP</label>
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength={6}
          />
        </div>

        <Button
          onClick={handleVerifyPhone}
          disabled={isVerifying || !email || !otp || otp.length !== 6}
          className="w-full"
        >
          <Phone className={`mr-2 h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? 'Vérification...' : 'Vérifier le téléphone'}
        </Button>
      </CardContent>
    </Card>
  );
}