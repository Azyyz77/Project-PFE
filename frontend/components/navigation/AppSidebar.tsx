/**
 * Sidebar Navigation - Replaced Header with shadcn Sidebar
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { getSidebarLinks } from '@/config/sidebarConfig';

export function AppSidebar() {
  const { user, logout: authLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const handleLogout = () => {
    authLogout();
    router.push('/login');
  };

  // Get role label and color
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'AGENT':
        return 'Agent SAV';
      case 'DIRECTION':
        return 'Direction';
      case 'CLIENT':
        return 'Client';
      default:
        return 'Utilisateur';
    }
  };

  const getRoleBadgeVariant = (role: string): any => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'AGENT':
        return 'default';
      case 'DIRECTION':
        return 'secondary';
      case 'CLIENT':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get dashboard link based on role
  const getDashboardLink = () => {
    switch (user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'AGENT':
        return '/dashboard/agent';
      case 'DIRECTION':
        return '/dashboard/direction';
      case 'CLIENT':
        return '/client/dashboard';
      default:
        return '/client/dashboard';
    }
  };

  // Get navigation items from config
  const navItems = getSidebarLinks(user.role || 'CLIENT');

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="border-b">
        <Link href={getDashboardLink()} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">STA</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">STA Chery</span>
            <span className="text-xs text-gray-500">Tunisia</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-0">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                    isActive={isActive}
                    className={isActive ? 'bg-blue-100 text-blue-700' : ''}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer - User Info */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="hover:bg-gray-100 rounded-md p-2 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.prenom.charAt(0)}
                      {user.nom.charAt(0) || ''}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.prenom}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* User Header */}
                <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-2 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {user.prenom.charAt(0)}
                      {user.nom.charAt(0) || ''}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.prenom} {user.nom}
                      </p>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Profile Link */}
                <DropdownMenuItem>
                  <Link href="/profile" className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4" />
                    <span>Mon profil</span>
                  </Link>
                </DropdownMenuItem>

                {/* Settings Link */}
                <DropdownMenuItem>
                  <Link href="/dashboard" className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
