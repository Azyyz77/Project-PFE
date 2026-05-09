import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ClientPageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ClientPageWrapper({ children, className = '' }: ClientPageWrapperProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
