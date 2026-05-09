/**
 * Card standardisée pour les pages client
 */

import { ReactNode } from 'react';
import { clientClasses, cn } from '@/config/clientTheme';
import { motion } from 'framer-motion';

interface ClientCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function ClientCard({ children, className = '', hover = true, padding = true }: ClientCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={hover ? { y: -5, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' } : {}}
      className={cn(
        clientClasses.card,
        !padding && 'p-0',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface ClientCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function ClientCardHeader({ title, subtitle, action }: ClientCardHeaderProps) {
  return (
    <div className={clientClasses.cardHeader}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className={clientClasses.cardTitle}>{title}</h3>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

interface ClientCardContentProps {
  children: ReactNode;
  className?: string;
}

export function ClientCardContent({ children, className = '' }: ClientCardContentProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  );
}
