/**
 * État de chargement standardisé pour les pages client
 */

import { Loader2 } from 'lucide-react';
import { clientClasses } from '@/config/clientTheme';

interface ClientLoadingStateProps {
  message?: string;
}

export function ClientLoadingState({ message = 'Chargement...' }: ClientLoadingStateProps) {
  return (
    <div className={clientClasses.loading}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
        <p className={clientClasses.loadingText}>{message}</p>
      </div>
    </div>
  );
}
