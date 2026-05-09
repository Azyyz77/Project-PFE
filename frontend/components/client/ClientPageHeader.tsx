/**
 * Header standardisé pour les pages client
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { clientClasses } from '@/config/clientTheme';

interface ClientPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function ClientPageHeader({ title, subtitle, icon: Icon, action }: ClientPageHeaderProps) {
  return (
    <div className={clientClasses.pageHeader}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={clientClasses.pageTitle}>
            {Icon && <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />}
            <span className="text-xl sm:text-2xl lg:text-3xl">{title}</span>
          </h1>
          {subtitle && (
            <p className={clientClasses.pageSubtitle}>{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
