import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clientTheme, cn } from '@/config/clientTheme';
import { ReactNode } from 'react';

interface ClientButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  fullWidth?: boolean;
}

export function ClientButton({
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  iconPosition = 'left',
  children,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ClientButtonProps) {
  const baseClass = clientTheme.button[variant];
  const sizeClass = size === 'small' ? clientTheme.button.small : size === 'large' ? clientTheme.button.large : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Icon size mapping
  const iconSizeClass = size === 'small' ? "h-3 w-3" : size === 'large' ? "h-5 w-5" : "h-4 w-4";
  
  return (
    <motion.button
      type={type}
      whileHover={!disabled ? { y: -2 } : {}}
      whileTap={!disabled ? { y: 0 } : {}}
      className={cn(
        baseClass,
        sizeClass,
        widthClass,
        'flex items-center justify-center gap-3 outline-none focus:ring-0 transition-all duration-300',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className={iconSizeClass} strokeWidth={1.5} />}
      <span className="whitespace-nowrap">{children}</span>
      {Icon && iconPosition === 'right' && <Icon className={iconSizeClass} strokeWidth={1.5} />}
    </motion.button>
  );
}
