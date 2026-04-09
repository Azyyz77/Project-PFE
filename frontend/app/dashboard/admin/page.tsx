'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Users, Building2, Car, Wrench, FileText, Settings, ChevronRight, MessageSquare, Package } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/unauthorized');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900 to-red-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const menuItems = [
    {
      title: 'Gérer les utilisateurs',
      icon: Users,
      href: '/dashboard/admin/users',
      description: 'Gérez les comptes et les rôles',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Gérer les agences',
      icon: Building2,
      href: '/dashboard/admin/agencies',
      description: 'Gérez les agences et leurs informations',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Tous les véhicules',
      icon: Car,
      href: '/dashboard/admin/vehicles',
      description: 'Consultez tous les véhicules enregistrés',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Toutes les commandes',
      icon: Wrench,
      href: '/dashboard/admin/orders',
      description: 'Suivez toutes les commandes de réparation',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Types d\'intervention',
      icon: Wrench,
      href: '/dashboard/admin/intervention-types',
      description: 'Gérez les types d\'interventions',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Sous-types',
      icon: Wrench,
      href: '/dashboard/admin/sub-types',
      description: 'Gérez les sous-types d\'interventions',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Marques et modèles',
      icon: Car,
      href: '/dashboard/admin/brands-models',
      description: 'Gérez les marques et modèles de véhicules',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Publier messages',
      icon: MessageSquare,
      href: '/dashboard/admin/messages',
      description: 'Envoyez des messages aux utilisateurs',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Rapports',
      icon: FileText,
      href: '/dashboard/admin/reports',
      description: 'Consultez les rapports et statistiques',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Paramètres',
      icon: Settings,
      href: '/dashboard/admin/settings',
      description: 'Configuration du système',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link key={index} href={item.href}>
                <div
                  className={`bg-gradient-to-r ${item.color} rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer shadow-lg`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                      <p className="text-sm text-white/80 mt-1">{item.description}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
