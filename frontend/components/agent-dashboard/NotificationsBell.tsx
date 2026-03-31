'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api/agentDashboard';
import { AgentNotification } from '@/types/agentDashboard';

export default function NotificationsBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AgentNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (token) {
      loadNotifications();
      // Polling could be added here
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      if (token) {
        const data = await fetchNotifications(token);
        setNotifications(data);
      }
    } catch (error) {
      console.error('Err notifications', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  const handleRead = async (id: number) => {
    try {
      if (!token) return;
      await markNotificationRead(token, id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      if (!token) return;
      await markAllNotificationsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/50">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleReadAll}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-slate-500 text-sm">Aucune notification</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.lu && handleRead(n.id)}
                  className={`p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer ${
                    !n.lu ? 'bg-slate-800/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-medium ${!n.lu ? 'text-white' : 'text-slate-300'}`}>
                      {n.titre}
                    </p>
                    {!n.lu && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {new Date(n.date_creation).toLocaleString('fr-FR')}
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
