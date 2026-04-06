'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { CheryVideoBackground } from '@/components/auth/CheryVideoBackground';

type AuthTheme = 'dark' | 'light';

interface AuthThemeShellProps {
  children: ReactNode;
  sceneClassName?: string;
}

export function AuthThemeShell({ children, sceneClassName = 'chery-auth-scene' }: AuthThemeShellProps) {
  const [theme, setTheme] = useState<AuthTheme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('auth-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('auth-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const sceneClasses = [sceneClassName, theme === 'light' ? 'auth-mode-light' : 'auth-mode-dark']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={sceneClasses}>
      <CheryVideoBackground />
      <div className="chery-auth-ambient" />
      <div className="chery-auth-grid" />

      <button
        type="button"
        onClick={toggleTheme}
        className="auth-theme-toggle"
        aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {children}
    </div>
  );
}
