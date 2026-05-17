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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
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
      description: 'Gérez les comptes clients, administrateurs et rôles système.',
      section: 'Operations',
    },
    {
      title: 'Gérer les agences',
      icon: Building2,
      href: '/dashboard/admin/agencies',
      description: 'Configurez et gérez les agences locales de la concession.',
      section: 'Operations',
    },
    {
      title: 'Tous les véhicules',
      icon: Car,
      href: '/dashboard/admin/vehicles',
      description: 'Consultez la flotte de véhicules enregistrés par les clients.',
      section: 'Operations',
    },
    {
      title: 'Toutes les commandes',
      icon: Wrench,
      href: '/dashboard/admin/orders',
      description: 'Suivez les ordres de réparation et commandes d\'intervention.',
      section: 'Operations',
    },
    {
      title: 'Types d\'intervention',
      icon: Wrench,
      href: '/dashboard/admin/intervention-types',
      description: 'Définissez le catalogue général des types d\'interventions.',
      section: 'Catalogue',
    },
    {
      title: 'Sous-types d\'intervention',
      icon: Wrench,
      href: '/dashboard/admin/sub-types',
      description: 'Ajustez les détails et sous-catégories de réparation.',
      section: 'Catalogue',
    },
    {
      title: 'Marques et modèles',
      icon: Car,
      href: '/dashboard/admin/brands-models',
      description: 'Gérez le référentiel des marques, modèles et versions.',
      section: 'Catalogue',
    },
    {
      title: 'Publier des messages',
      icon: MessageSquare,
      href: '/dashboard/admin/messages',
      description: 'Envoyez des alertes et communiqués aux utilisateurs.',
      section: 'Catalogue',
    },
    {
      title: 'Rapports et analyses',
      icon: FileText,
      href: '/dashboard/admin/reports',
      description: 'Consultez les bilans financiers, temps d\'attente et stats.',
      section: 'Analyse',
    },
    {
      title: 'Paramètres système',
      icon: Settings,
      href: '/dashboard/admin/settings',
      description: 'Configurez les options générales du portail concessionnaire.',
      section: 'Analyse',
    },
  ];

  const sections = [
    {
      title: 'Gestion opérationnelle',
      subtitle: 'Pilotage quotidien des entités, flottes et commandes',
      key: 'Operations',
    },
    {
      title: 'Référentiel & Services',
      subtitle: 'Structure de l\'offre technique et communication',
      key: 'Catalogue',
    },
    {
      title: 'Suivi & Paramètres',
      subtitle: 'Vision de performance globale et réglages',
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
      label: 'Opérationnel',
      value: menuItems.filter((item) => item.section === 'Operations').length,
      icon: ShieldCheck,
    },
    {
      label: 'Catalogue',
      value: menuItems.filter((item) => item.section === 'Catalogue').length,
      icon: Sparkles,
    },
    {
      label: 'Suivi',
      value: menuItems.filter((item) => item.section === 'Analyse').length,
      icon: FileText,
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 relative overflow-hidden flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
            <Sparkles className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">VUE GLOBALE</p>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 leading-none tracking-tight">Tableau de Bord Administration</h1>
            <p className="text-sm text-slate-500 mt-2">Espace de supervision, de configuration et de pilotage centralisé.</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold text-orange-600">
          STA Chery Tunisie
        </span>
      </motion.div>

      {/* Stats Counter Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: index * 0.03 }}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
                <Icon className="w-6 h-6 text-orange-500" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Group Sections and Cards Grid */}
      <div className="space-y-10">
        {sections.map((section, sectionIndex) => {
          const sectionItems = menuItems.filter((item) => item.section === section.key);

          return (
            <section key={section.key} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: sectionIndex * 0.05 }}
                className="pb-2 border-b border-slate-200/60"
              >
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-orange-600">{section.title}</p>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{section.subtitle}</h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sectionItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: (sectionIndex * 0.06) + (index * 0.02) }}
                      className="group"
                    >
                      <Link href={item.href}>
                        <div className="h-full bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-orange-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100/50 transition-colors group-hover:bg-orange-100/50">
                              <Icon className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-xs font-semibold text-orange-600 mt-6 pt-4 border-t border-slate-50">
                            Accéder au module
                            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
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
