'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft, Loader2, Send, Users as UsersIcon, UserCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';

interface RecentMessage {
  titre: string;
  message: string;
  date_envoi: string;
  recipients_count: number;
}

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [titre, setTitre] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'clients' | 'agents'>('all');
  const [sending, setSending] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadRecentMessages();
    }
  }, [user]);

  const loadRecentMessages = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/admin/messages/recent`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      setRecentMessages(result.messages || []);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titre.trim() || !message.trim()) {
      toast.error('Veuillez saisir un titre et un message');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSending(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/admin/messages/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titre, message, target }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Message envoyé à ${result.recipients} utilisateur(s)`);
        setTitre('');
        setMessage('');
        loadRecentMessages();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const getTargetLabel = (count: number) => {
    return `${count} destinataire${count > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Il y a moins d\'une heure';
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
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
            <MessageSquare className="w-7 h-7 text-orange-500" />
            Publier des messages
          </h1>
          <p className="text-slate-500 text-xs mt-1">Diffusez des alertes ou des annonces générales aux clients et agents sur la plateforme.</p>
        </div>
      </div>

      {/* Main Form container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSend} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Titre du message *</label>
            <Input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
              placeholder="Ex: Maintenance de la plateforme"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Cible des destinataires *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTarget('all')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-3 ${
                  target === 'all'
                    ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UsersIcon className={`w-5 h-5 ${target === 'all' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <p className="font-extrabold text-sm">Tous</p>
                </div>
                <p className="text-xs text-slate-500 leading-normal">Clients et agents</p>
              </button>
              
              <button
                type="button"
                onClick={() => setTarget('clients')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-3 ${
                  target === 'clients'
                    ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className={`w-5 h-5 ${target === 'clients' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <p className="font-extrabold text-sm">Clients</p>
                </div>
                <p className="text-xs text-slate-500 leading-normal">Clients uniquement</p>
              </button>

              <button
                type="button"
                onClick={() => setTarget('agents')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-3 ${
                  target === 'agents'
                    ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-5 h-5 ${target === 'agents' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <p className="font-extrabold text-sm">Agents</p>
                </div>
                <p className="text-xs text-slate-500 leading-normal">Agents uniquement</p>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Contenu du message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
              rows={6}
              placeholder="Rédigez le contenu de votre annonce ici..."
              required
            />
            <p className="text-slate-400 text-[10px] font-bold text-right tracking-wide uppercase">{message.length} caractères</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50">
            <h3 className="text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">Aperçu en direct</h3>
            <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
              <p className="text-slate-900 font-extrabold text-sm">{titre || 'Titre du message'}</p>
              <p className="text-slate-600 text-xs mt-1.5 whitespace-pre-wrap leading-relaxed">
                {message || 'Votre message apparaîtra ici...'}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={sending || !titre.trim() || !message.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold py-2 shadow-sm transition-all"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer l'annonce
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Recent Messages list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4 tracking-tight">Historique des annonces</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : recentMessages.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium text-center py-8">Aucun message diffusé récemment</p>
        ) : (
          <div className="space-y-4">
            {recentMessages.map((msg, index) => (
              <div key={index} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-slate-900 font-extrabold text-sm">{msg.titre}</p>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed line-clamp-2">{msg.message}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold pt-2 border-t border-slate-200/40">
                  <span className="text-slate-400">{formatDate(msg.date_envoi)}</span>
                  <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100/60">{getTargetLabel(msg.recipients_count)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
