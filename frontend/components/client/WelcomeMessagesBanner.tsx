'use client';

import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, Megaphone, Wrench, AlertCircle, ExternalLink } from 'lucide-react';
import { getActiveMessages, markMessageAsRead } from '@/lib/api/welcomeMessages';
import { WelcomeMessage, MessageType } from '@/types/promotions';

interface WelcomeMessagesBannerProps {
  afficherAccueil?: boolean;
  afficherDashboard?: boolean;
}

const MESSAGE_ICONS: Record<MessageType, React.ReactNode> = {
  INFO: <Info className="w-5 h-5" />,
  ALERTE: <AlertTriangle className="w-5 h-5" />,
  PROMOTION: <Megaphone className="w-5 h-5" />,
  MAINTENANCE: <Wrench className="w-5 h-5" />,
  URGENT: <AlertCircle className="w-5 h-5" />
};

const MESSAGE_COLORS: Record<MessageType, string> = {
  INFO: 'bg-blue-50 border-blue-200 text-blue-900',
  ALERTE: 'bg-amber-50 border-amber-200 text-amber-900',
  PROMOTION: 'bg-purple-50 border-purple-200 text-purple-900',
  MAINTENANCE: 'bg-slate-50 border-slate-200 text-slate-900',
  URGENT: 'bg-red-50 border-red-200 text-red-900'
};

const MESSAGE_ICON_COLORS: Record<MessageType, string> = {
  INFO: 'text-blue-600',
  ALERTE: 'text-amber-600',
  PROMOTION: 'text-purple-600',
  MAINTENANCE: 'text-slate-600',
  URGENT: 'text-red-600'
};

export default function WelcomeMessagesBanner({
  afficherAccueil,
  afficherDashboard
}: WelcomeMessagesBannerProps) {
  const [messages, setMessages] = useState<WelcomeMessage[]>([]);
  const [dismissedMessages, setDismissedMessages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [afficherAccueil, afficherDashboard]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (afficherAccueil !== undefined) params.afficher_accueil = afficherAccueil;
      if (afficherDashboard !== undefined) params.afficher_dashboard = afficherDashboard;
      
      const data = await getActiveMessages(params);
      setMessages(data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (messageId: number) => {
    setDismissedMessages(prev => new Set(prev).add(messageId));
    try {
      await markMessageAsRead(messageId);
    } catch (error) {
      console.error('Erreur lors du marquage du message:', error);
    }
  };

  const visibleMessages = messages.filter(msg => !dismissedMessages.has(msg.id));

  if (loading || visibleMessages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleMessages.map(message => {
        const colorClass = message.couleur_fond 
          ? '' 
          : MESSAGE_COLORS[message.type] || MESSAGE_COLORS.INFO;
        
        const iconColorClass = MESSAGE_ICON_COLORS[message.type] || MESSAGE_ICON_COLORS.INFO;
        
        const icon = message.icone 
          ? <span className="text-2xl">{message.icone}</span>
          : MESSAGE_ICONS[message.type] || MESSAGE_ICONS.INFO;

        return (
          <div
            key={message.id}
            className={`rounded-xl border-2 p-4 shadow-sm ${colorClass}`}
            style={message.couleur_fond ? { backgroundColor: message.couleur_fond } : undefined}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 ${iconColorClass}`}>
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1">{message.titre}</h3>
                <p className="text-sm whitespace-pre-wrap">{message.contenu}</p>
                
                {/* Link */}
                {message.lien_url && (
                  <a
                    href={message.lien_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm font-medium hover:underline"
                  >
                    {message.lien_texte || 'En savoir plus'}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => handleDismiss(message.id)}
                className="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
