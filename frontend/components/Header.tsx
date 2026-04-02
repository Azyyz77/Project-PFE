'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MobileMenu } from './MobileMenu';
import { LogOut, User, Settings } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'AGENT':
        return 'Agent SAV';
      case 'DIRECTION':
        return 'Direction';
      default:
        return 'Client';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'AGENT':
        return 'bg-blue-100 text-blue-800';
      case 'DIRECTION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

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
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href={getDashboardLink()} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">STA</span>
          </div>
          <span className="hidden sm:inline text-xl font-bold text-gray-900">STA Chery</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href={getDashboardLink()} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Tableau de bord
          </Link>
          <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Profil
          </Link>
        </div>

        {/* User Menu + Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <MobileMenu />

          {/* User Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {user.prenom.charAt(0)}
                {user.nom.charAt(0) || ''}
              </div>
              <div className="text-left hidden lg:block">
                <p className="font-medium text-gray-900 text-sm leading-none">
                  {user.prenom}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
                role="menu"
              >
                {/* User Info */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                </div>

                {/* Menu Items */}
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                  role="menuitem"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span>Mon profil</span>
                </Link>

                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                  role="menuitem"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span>Tableau de bord</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
