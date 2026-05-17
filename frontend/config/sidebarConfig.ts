/**
 * Sidebar Configuration
 * Role-based navigation links for all user types
 */

import {
  LayoutDashboard,
  Car,
  Wrench,
  CalendarPlus,
  Receipt,
  UserCircle,
  Users,
  Building2,
  FileText,
  BarChart3,
  Settings,
  PieChart,
  TrendingUp,
  Briefcase,
  DollarSign,
} from 'lucide-react';

export const clientLinks = [
  { label: 'Tableau de bord', href: '/client/dashboard', icon: LayoutDashboard },
  { label: 'Mes véhicules', href: '/client/vehicles', icon: Car },
  { label: 'Réserver un rendez-vous', href: '/dashboard/rendez-vous', icon: CalendarPlus },
  { label: 'Mes factures', href: '/client/invoices', icon: Receipt },
  { label: 'Mon profil', href: '/profile', icon: UserCircle },
];

export const agentLinks = [
  { label: 'Tableau de bord', href: '/dashboard/agent', icon: LayoutDashboard },
  { label: 'Toutes les commandes', href: '/dashboard/agent/repair-orders', icon: FileText },
  { label: 'Inspection de véhicule', href: '/dashboard/agent/vehicle-inspection', icon: Car },
  { label: 'Mes clients', href: '/dashboard/agent/clients', icon: Users },
  { label: 'Rendez-vous', href: '/dashboard/agent/appointments', icon: CalendarPlus },
  { label: 'Reclamations', href: '/dashboard/agent/complaints', icon: Wrench },
];

export const adminLinks = [
  { label: 'Tableau de bord', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Gérer les utilisateurs', href: '/dashboard/admin/users', icon: Users },
  { label: 'Gérer les agences', href: '/dashboard/admin/agencies', icon: Building2 },
  { label: 'Tous les véhicules', href: '/dashboard/admin/vehicles', icon: Car },
  { label: 'Toutes les commandes', href: '/dashboard/admin/orders', icon: FileText },
  { label: 'Rapports', href: '/dashboard/admin/reports', icon: BarChart3 },
  { label: 'Paramètres', href: '/dashboard/admin/settings', icon: Settings },
];

export const directionLinks = [
  { label: 'Tableau de bord', href: '/dashboard/direction', icon: LayoutDashboard },
  { label: 'Statistiques globales', href: '/dashboard/direction/statistics', icon: PieChart },
  { label: 'Aperçu des agences', href: '/dashboard/direction/agencies-overview', icon: Building2 },
  { label: 'Rapports de performance', href: '/dashboard/direction/performance-reports', icon: TrendingUp },
  { label: 'Aperçu du personnel', href: '/dashboard/direction/staff-overview', icon: Briefcase },
  { label: 'Revenus et facturation', href: '/dashboard/direction/revenue-billing', icon: DollarSign },
];

export const getSidebarLinks = (role: string) => {
  switch (role) {
    case 'CLIENT':
      return clientLinks;
    case 'AGENT':
      return agentLinks;
    case 'ADMIN':
      return adminLinks;
    case 'DIRECTION':
      return directionLinks;
    default:
      return clientLinks;
  }
};
