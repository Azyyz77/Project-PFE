'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Mobile Navigation Menu
 */

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  const getDashboardLink = () => {
    switch (user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'AGENT':
        return '/dashboard/agent';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <nav className="flex flex-col p-4 gap-2">
            <Link
              href={getDashboardLink()}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              Tableau de bord
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              Profil
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
