'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings, ArrowLeft, Loader2, Save, Bell, Shield, Database, Mail } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Paramètres
            </h1>
            <p className="text-white/70 mt-1">Configuration du système</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-orange-500 text-white'
                          : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Paramètres généraux</h2>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Nom de l'application</label>
                    <input
                      type="text"
                      defaultValue="STA Chery Tunisia"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Fuseau horaire</label>
                    <select className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500">
                      <option>Africa/Tunis</option>
                      <option>Europe/Paris</option>
                      <option>UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Langue par défaut</label>
                    <select className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500">
                      <option>Français</option>
                      <option>Arabe</option>
                      <option>Anglais</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="maintenance"
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <label htmlFor="maintenance" className="text-white/70">
                      Mode maintenance
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Notifications par email</p>
                        <p className="text-white/60 text-sm">Recevoir les notifications importantes par email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Notifications WhatsApp</p>
                        <p className="text-white/60 text-sm">Envoyer des notifications via WhatsApp</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Alertes système</p>
                        <p className="text-white/60 text-sm">Recevoir les alertes critiques du système</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Rapports hebdomadaires</p>
                        <p className="text-white/60 text-sm">Recevoir un rapport hebdomadaire par email</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 rounded" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Sécurité</h2>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Durée de validité du token JWT (heures)
                    </label>
                    <input
                      type="number"
                      defaultValue="24"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Nombre maximum de tentatives de connexion
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="2fa"
                      defaultChecked
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <label htmlFor="2fa" className="text-white/70">
                      Activer l'authentification à deux facteurs
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="password-policy"
                      defaultChecked
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <label htmlFor="password-policy" className="text-white/70">
                      Politique de mot de passe forte
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'database' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Base de données</h2>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/60 text-sm">Serveur</p>
                        <p className="text-white font-medium">SQL Server</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Base de données</p>
                        <p className="text-white font-medium">STA_SAV_DB</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Statut</p>
                        <p className="text-green-400 font-medium">Connecté</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Version</p>
                        <p className="text-white font-medium">2019</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      onClick={() => toast.info('Sauvegarde en cours...')}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Créer une sauvegarde
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="auto-backup"
                      defaultChecked
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <label htmlFor="auto-backup" className="text-white/70">
                      Sauvegarde automatique quotidienne
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Configuration Email</h2>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Serveur SMTP</label>
                    <input
                      type="text"
                      placeholder="smtp.example.com"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Port SMTP</label>
                    <input
                      type="number"
                      defaultValue="587"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Email expéditeur</label>
                    <input
                      type="email"
                      placeholder="noreply@stachery.tn"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Nom expéditeur</label>
                    <input
                      type="text"
                      defaultValue="STA Chery Tunisia"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="ssl"
                      defaultChecked
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <label htmlFor="ssl" className="text-white/70">
                      Utiliser SSL/TLS
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/20">
                <Button
                  onClick={handleSave}
                  className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder les modifications
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
