'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api/agentDashboard';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  titre: string;
  message: string;
  lu: boolean;
  date_creation: string;
}

export default function NotificationsBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      if (token) {
        const data = await fetchNotifications();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Err notifications', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.lu).length;

  const handleRead = async (id: number) => {
    try {
      if (!token) return;
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      if (!token) return;
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-400 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white min-w-4">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 rounded-lg border border-slate-800 bg-slate-900 shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReadAll}
                className="text-xs text-blue-400 hover:text-blue-300 h-auto px-2 py-1"
              >
                Tout marquer lu
              </Button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-slate-500 text-sm">Aucune notification</p>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={n.id}
                  onClick={() => !n.lu && handleRead(n.id)}
                  className={`p-4 transition-colors cursor-pointer border-b border-slate-800/50 ${
                    !n.lu ? 'bg-slate-800/30 hover:bg-slate-800/50' : 'hover:bg-slate-800/20'
                  } ${idx === notifications.length - 1 ? 'border-b-0' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-medium ${!n.lu ? 'text-white' : 'text-slate-300'}`}>
                      {n.titre}
                    </p>
                    {!n.lu && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {new Intl.DateTimeFormat('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(n.date_creation))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
