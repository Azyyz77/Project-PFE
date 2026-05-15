'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen admin-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="admin-page p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              Publier messages
            </h1>
            <p className="text-white/70 mt-1">Envoyez des messages aux utilisateurs</p>
          </div>
        </div>

        <div className="admin-card p-6 border border-white/20 mb-6">
          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Titre</label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-orange-500"
                placeholder="Ex: Maintenance programmée"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Destinataires</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTarget('all')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    target === 'all'
                      ? 'border-orange-500 bg-orange-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <p className="font-semibold">Tous</p>
                  <p className="text-sm opacity-70">Tous les utilisateurs</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('clients')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    target === 'clients'
                      ? 'border-orange-500 bg-orange-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <p className="font-semibold">Clients</p>
                  <p className="text-sm opacity-70">Clients uniquement</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('agents')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    target === 'agents'
                      ? 'border-orange-500 bg-orange-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <p className="font-semibold">Agents</p>
                  <p className="text-sm opacity-70">Agents uniquement</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-orange-500"
                rows={8}
                placeholder="Saisissez votre message ici..."
                required
              />
              <p className="text-white/50 text-sm mt-2">{message.length} caractères</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-2">Aperçu</h3>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white font-semibold mb-2">{titre || 'Titre du message'}</p>
                <p className="text-white/80 whitespace-pre-wrap">
                  {message || 'Votre message apparaîtra ici...'}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={sending || !titre.trim() || !message.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer le message
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="admin-card p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Messages récents</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : recentMessages.length === 0 ? (
            <p className="text-white/50 text-center py-8">Aucun message publié</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{msg.titre}</p>
                      <p className="text-white/70 text-sm mt-1 line-clamp-2">{msg.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{formatDate(msg.date_envoi)}</span>
                    <span className="text-orange-500">{getTargetLabel(msg.recipients_count)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

