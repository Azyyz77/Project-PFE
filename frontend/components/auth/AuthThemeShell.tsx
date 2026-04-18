'use client';

import { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle'; // Assuming a standard ThemeToggle exists or we'll just skip it

interface AuthThemeShellProps {
  children: ReactNode;
  sceneClassName?: string;
}

export function AuthThemeShell({ children, sceneClassName }: AuthThemeShellProps) {
  return (
    <div className={`min-h-screen bg-muted/30 flex flex-col relative ${sceneClassName || ''}`}>
      <div className="absolute top-4 right-4 z-50">
        {/* Put ThemeToggle here if available in the codebase, else nothing */}
      </div>
      {children}
    </div>
  );
}
