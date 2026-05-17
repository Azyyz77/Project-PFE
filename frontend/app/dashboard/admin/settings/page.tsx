'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings, ArrowLeft, Loader2, Save, Bell, Shield, Database, Mail, ToggleLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  const handleSave = () => {
    toast.success('Paramètres sauvegardés avec succès');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'database', label: 'Base de données', icon: Database },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <Settings className="w-7 h-7 text-orange-500" />
            Paramètres système
          </h1>
          <p className="text-slate-500 text-xs mt-1">Configurez l'ensemble des modules, les durées de jeton de sécurité, les notifications et la base de données.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                      activeTab === tab.id
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
            <div>
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">Paramètres généraux</h2>
                    <p className="text-slate-400 text-xs font-medium">Définissez le nom, le fuseau horaire et les langues d'exploitation.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom de l'application</label>
                    <input
                      type="text"
                      defaultValue="STA Chery Tunisia"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Fuseau horaire</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold">
                      <option>Africa/Tunis</option>
                      <option>Europe/Paris</option>
                      <option>UTC</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Langue par défaut</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold">
                      <option>Français</option>
                      <option>Arabe</option>
                      <option>Anglais</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <input
                      type="checkbox"
                      id="maintenance"
                      className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                    />
                    <label htmlFor="maintenance" className="text-xs font-bold text-rose-800 cursor-pointer select-none">
                      Activer le Mode maintenance (Bloquer l'accès public au portail)
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">Configuration des alertes</h2>
                    <p className="text-slate-400 text-xs font-medium">Configurez les canaux d'envoi et notifications push.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Notifications par email</p>
                        <p className="text-slate-400 text-xs">Recevoir les notifications importantes par email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Notifications WhatsApp</p>
                        <p className="text-slate-400 text-xs">Envoyer des confirmations de rendez-vous via WhatsApp</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Alertes système</p>
                        <p className="text-slate-400 text-xs">Recevoir les alertes critiques de panne serveur</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Rapports hebdomadaires</p>
                        <p className="text-slate-400 text-xs">Recevoir un rapport automatisé par email chaque lundi</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">Paramètres de sécurité</h2>
                    <p className="text-slate-400 text-xs font-medium">Définissez les restrictions et politiques d'accès utilisateur.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">
                      Durée de validité du token JWT (heures)
                    </label>
                    <input
                      type="number"
                      defaultValue="24"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">
                      Nombre maximum de tentatives de connexion
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="2fa"
                      defaultChecked
                      className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="2fa" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      Activer l'authentification à deux facteurs obligatoire
                    </label>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="password-policy"
                      defaultChecked
                      className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="password-policy" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      Exiger un mot de passe fort (chiffres, symboles, majuscules)
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'database' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">Statut Base de données</h2>
                    <p className="text-slate-400 text-xs font-medium">Consultez les informations de connexion et gérez les sauvegardes.</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Serveur SQL</p>
                        <p className="text-sm font-extrabold text-slate-900 mt-0.5">Microsoft SQL Server</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Base de données</p>
                        <p className="text-sm font-extrabold text-slate-900 mt-0.5">STA_SAV_DB</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Statut Connexion</p>
                        <p className="text-sm font-extrabold text-emerald-600 mt-0.5">Connecté & Actif</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Version API</p>
                        <p className="text-sm font-extrabold text-slate-900 mt-0.5">v2019 Core Engine</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      onClick={() => toast.info('Sauvegarde en cours...')}
                      className="bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold text-xs py-2 shadow-sm"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Lancer une sauvegarde manuelle
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="auto-backup"
                      defaultChecked
                      className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="auto-backup" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      Sauvegarde automatique quotidienne à 23h59
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">Configuration SMTP Email</h2>
                    <p className="text-slate-400 text-xs font-medium">Paramétrez le compte SMTP pour l'envoi de courriels automatiques.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Serveur SMTP</label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Port SMTP</label>
                    <input
                      type="number"
                      defaultValue="587"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Email expéditeur</label>
                    <input
                      type="email"
                      placeholder="noreply@stachery.tn"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Nom expéditeur</label>
                    <input
                      type="text"
                      defaultValue="STA Chery Tunisia"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="ssl"
                      defaultChecked
                      className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="ssl" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      Utiliser une connexion sécurisée SSL/TLS
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <Button
                onClick={handleSave}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold py-2 px-5 shadow-sm transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder les modifications
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
