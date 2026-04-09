'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Car,
  Wrench,
  FileText,
  Settings,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center admin-page">
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
      color: 'from-cyan-500/30 to-cyan-700/30 border-cyan-300/20',
      section: 'Operations',
    },
    {
      title: 'Gérer les agences',
      icon: Building2,
      href: '/dashboard/admin/agencies',
      description: 'Gérez les agences et leurs informations',
      color: 'from-cyan-500/30 to-cyan-700/30 border-cyan-300/20',
      section: 'Operations',
    },
    {
      title: 'Tous les véhicules',
      icon: Car,
      href: '/dashboard/admin/vehicles',
      description: 'Consultez tous les véhicules enregistrés',
      color: 'from-cyan-500/30 to-cyan-700/30 border-cyan-300/20',
      section: 'Operations',
    },
    {
      title: 'Toutes les commandes',
      icon: Wrench,
      href: '/dashboard/admin/orders',
      description: 'Suivez toutes les commandes de réparation',
      color: 'from-cyan-500/30 to-cyan-700/30 border-cyan-300/20',
      section: 'Operations',
    },
    {
      title: 'Types d\'intervention',
      icon: Wrench,
      href: '/dashboard/admin/intervention-types',
      description: 'Gérez les types d\'interventions',
      color: 'from-indigo-500/30 to-indigo-700/30 border-indigo-300/20',
      section: 'Catalogue',
    },
    {
      title: 'Sous-types',
      icon: Wrench,
      href: '/dashboard/admin/sub-types',
      description: 'Gérez les sous-types d\'interventions',
      color: 'from-indigo-500/30 to-indigo-700/30 border-indigo-300/20',
      section: 'Catalogue',
    },
    {
      title: 'Marques et modèles',
      icon: Car,
      href: '/dashboard/admin/brands-models',
      description: 'Gérez les marques et modèles de véhicules',
      color: 'from-indigo-500/30 to-indigo-700/30 border-indigo-300/20',
      section: 'Catalogue',
    },
    {
      title: 'Publier messages',
      icon: MessageSquare,
      href: '/dashboard/admin/messages',
      description: 'Envoyez des messages aux utilisateurs',
      color: 'from-indigo-500/30 to-indigo-700/30 border-indigo-300/20',
      section: 'Catalogue',
    },
    {
      title: 'Rapports',
      icon: FileText,
      href: '/dashboard/admin/reports',
      description: 'Consultez les rapports et statistiques',
      color: 'from-emerald-500/30 to-emerald-700/30 border-emerald-300/20',
      section: 'Analyse',
    },
    {
      title: 'Paramètres',
      icon: Settings,
      href: '/dashboard/admin/settings',
      description: 'Configuration du système',
      color: 'from-emerald-500/30 to-emerald-700/30 border-emerald-300/20',
      section: 'Analyse',
    },
  ];

  const sections = [
    {
      title: 'Gestion operationnelle',
      subtitle: 'Pilotage quotidien des entites, flottes et commandes',
      key: 'Operations',
    },
    {
      title: 'Referentiel services',
      subtitle: 'Structure de l offre technique et communication',
      key: 'Catalogue',
    },
    {
      title: 'Suivi et parametres',
      subtitle: 'Vision de performance et reglages globaux',
      key: 'Analyse',
    },
  ] as const;

  const stats = [
    {
      label: 'Modules actifs',
      value: menuItems.length,
      icon: Activity,
    },
    {
      label: 'Gestion operationnelle',
      value: menuItems.filter((item) => item.section === 'Operations').length,
      icon: ShieldCheck,
    },
    {
      label: 'Catalogue services',
      value: menuItems.filter((item) => item.section === 'Catalogue').length,
      icon: Sparkles,
    },
    {
      label: 'Suivi et analyse',
      value: menuItems.filter((item) => item.section === 'Analyse').length,
      icon: FileText,
    },
  ];

  return (
    <div className="admin-page p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="mb-8 admin-card p-6 border border-slate-700/50 relative overflow-hidden"
        >
          <div className="admin-dashboard-beam" />
          <div className="flex items-start gap-4 justify-between flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Vue Globale</p>
                <h1 className="text-3xl font-bold text-slate-100">Tableau de bord Administrateur</h1>
                <p className="text-sm text-slate-300 mt-1">Espace de supervision, de configuration et de pilotage.</p>
              </div>
            </div>

            <span className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-100">
              Centre de commandement
            </span>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.04 }}
                className="admin-card p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
                  <Icon className="w-4 h-4 text-cyan-300" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-100">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {sections.map((section, sectionIndex) => {
          const sectionItems = menuItems.filter((item) => item.section === section.key);

          return (
            <section key={section.key} className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: sectionIndex * 0.06 }}
                className="mb-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{section.title}</p>
                <h2 className="text-xl font-semibold text-slate-100 mt-1">{section.subtitle}</h2>
              </motion.div>

              <div className="space-y-5">
                {sectionItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: (sectionIndex * 0.08) + (index * 0.03) }}
                    >
                      <Link href={item.href}>
                        <div
                          className={`admin-car-card bg-gradient-to-r ${item.color} rounded-3xl p-0 transition-all cursor-pointer border`}
                        >
                          <div className="admin-car-wind" />
                          <div className="admin-car-wheel admin-car-wheel-left" />
                          <div className="admin-car-wheel admin-car-wheel-right" />

                          <div className="admin-car-body px-6 py-6 sm:px-7">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-900/60 rounded-xl flex items-center justify-center border border-slate-700/70">
                                <Icon className="w-6 h-6 text-slate-100" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-slate-100">{item.title}</h3>
                                <p className="text-sm text-slate-300 mt-1">{item.description}</p>
                              </div>
                              <ChevronRight className="admin-car-arrow w-6 h-6 text-slate-300" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

