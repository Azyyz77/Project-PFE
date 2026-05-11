import { LucideIcon } from 'lucide-react';
import { clientClasses, cn } from '@/config/clientTheme';
import { motion } from 'framer-motion';

interface ClientStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function ClientStatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-blue-500',
  subtitle,
  trend,
}: ClientStatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(clientClasses.statCard, "relative overflow-hidden group")}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={clientClasses.statLabel}>{label}</p>
          <div className="flex items-baseline gap-2">
            <h4 className={clientClasses.statValue}>{value}</h4>
            {trend && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                trend.isPositive ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[#B0B3B8] text-[10px] font-bold uppercase tracking-wider">{subtitle}</p>
          )}
        </div>
        
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg bg-[#F0F2F5] transition-colors group-hover:bg-blue-50",
          iconColor.replace('text-', 'bg-').replace('500', '100') // Dynamic background based on text color
        )}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}
