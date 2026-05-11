/**
 * État vide standardisé pour les pages client
 */

import { LucideIcon } from 'lucide-react';
import { clientClasses } from '@/config/clientTheme';
import { ClientButton } from './ClientButton';

interface ClientEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ClientEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: ClientEmptyStateProps) {
  return (
    <div className={clientClasses.emptyState}>
      <Icon className={clientClasses.emptyIcon} />
      <p className={clientClasses.emptyText}>{title}</p>
      {description && (
        <p className="text-[#8A8D91] text-sm mt-2">{description}</p>
      )}
      {actionLabel && onAction && (
        <ClientButton
          variant="primary"
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel}
        </ClientButton>
      )}
    </div>
  );
}
