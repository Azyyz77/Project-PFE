'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notification {
  id: number;
  titre: string;
  message: string;
  lu: boolean;
  type: string;
  date_envoi: string;
}

export default function NotificationBell() {
  const { language, t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const API_URL = rawBaseUrl.endsWith('/api')
        ? rawBaseUrl.slice(0, -4)
        : rawBaseUrl.replace(/\/$/, '');
      const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        // Silently fail if endpoint doesn't exist or server is down
        return;
      }
      
      const result = await response.json();
      setUnreadCount(result.unreadCount || 0);
    } catch (error) {
      // Silently fail - notifications are not critical
      // console.error('Erreur chargement compteur:', error);
    }
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const API_URL = rawBaseUrl.endsWith('/api')
        ? rawBaseUrl.slice(0, -4)
        : rawBaseUrl.replace(/\/$/, '');
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        setNotifications([]);
        return;
      }
      
      const result = await response.json();
      setNotifications(result.notifications || []);
    } catch (error) {
      // Silently fail - notifications are not critical
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const API_URL = rawBaseUrl.endsWith('/api')
        ? rawBaseUrl.slice(0, -4)
        : rawBaseUrl.replace(/\/$/, '');
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, lu: true } : n
      ));
      loadUnreadCount();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const API_URL = rawBaseUrl.endsWith('/api')
        ? rawBaseUrl.slice(0, -4)
        : rawBaseUrl.replace(/\/$/, '');
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      setNotifications(notifications.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
      toast.success(t('notifications.markedReadSuccess'));
    } catch (error) {
      console.error('Erreur marquage notifications:', error);
    }
  };

  const handleTogglePanel = () => {
    if (!showPanel) {
      loadNotifications();
    }
    setShowPanel(!showPanel);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('notifications.justNow');
    if (diffMins < 60) return t('notifications.minutesAgo').replace('{count}', String(diffMins));
    if (diffHours < 24) return t('notifications.hoursAgo').replace('{count}', String(diffHours));
    if (diffDays === 1) return t('notifications.yesterday');
    if (diffDays < 7) return t('notifications.daysAgo').replace('{count}', String(diffDays));
    return date.toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR');
  };

  return (
    <div className="relative">
      <button
        onClick={handleTogglePanel}
        className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPanel(false)}
          />
          <div className="notification-panel-animate absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">{t('notifications.title')}</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                    className="text-xs text-orange-600 hover:text-orange-700"
                  >
                    {t('notifications.markAllRead')}
                  </Button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  {t('notifications.loading')}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {t('notifications.empty')}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif, index) => (
                    <div
                      key={notif.id}
                      className={`notification-item-animate p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notif.lu ? 'bg-orange-50' : ''
                      }`}
                      style={{ animationDelay: `${index * 60}ms` }}
                      onClick={() => !notif.lu && markAsRead(notif.id)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{notif.titre}</p>
                        {!notif.lu && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400">{formatDate(notif.date_envoi)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
