'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-white/10 bg-white/5 ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Basculer le thème"
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={`
        group relative flex items-center justify-center w-9 h-9 rounded-xl
        border transition-all duration-300
        ${isDark
          ? 'border-white/10 bg-white/[0.05] hover:bg-white/[0.10] hover:border-white/20 text-white/60 hover:text-amber-300'
          : 'border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-500 hover:text-amber-500 shadow-sm'
        }
        ${className}
      `}
    >
      {/* Sun icon */}
      <Sun
        className={`absolute w-4 h-4 transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'
        }`}
      />
      {/* Moon icon */}
      <Moon
        className={`absolute w-4 h-4 transition-all duration-300 ${
          isDark ? 'opacity-0 -rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
    </button>
  );
}
