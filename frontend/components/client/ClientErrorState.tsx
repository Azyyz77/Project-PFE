/**
 * État d'erreur standardisé pour les pages client
 */

import { AlertCircle } from 'lucide-react';
import { clientClasses } from '@/config/clientTheme';
import { ClientButton } from './ClientButton';

interface ClientErrorStateProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ClientErrorState({ message, onRetry, onBack }: ClientErrorStateProps) {
  return (
    <div className={clientClasses.error}>
      <AlertCircle className={clientClasses.errorIcon} />
      <p className={clientClasses.errorText}>{message}</p>
      <div className="flex gap-3 justify-center mt-4">
        {onRetry && (
          <ClientButton variant="primary" onClick={onRetry}>
            Réessayer
          </ClientButton>
        )}
        {onBack && (
          <ClientButton variant="outline" onClick={onBack}>
            Retour
          </ClientButton>
        )}
      </div>
    </div>
  );
}
