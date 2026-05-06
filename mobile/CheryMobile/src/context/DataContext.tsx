import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../config/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  vehicles: any[];
  appointments: any[];
  complaints: any[];
  orders: any[];
  notifications: any[];
  agencies: any[];
  interventions: any[];
  brands: any[];
  versionsCatalog: any[];
  loadingData: boolean;
  loadingBooking: boolean;
  loadUserData: () => Promise<void>;
  loadBookingData: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [versionsCatalog, setVersionsCatalog] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setVehicles([]);
      setAppointments([]);
      setComplaints([]);
      setOrders([]);
      setNotifications([]);
    }
  }, [user]);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [vehiclesRes, appointmentsRes, complaintsRes, notifRes] = await Promise.allSettled([
        api.get(`/vehicles/user/${user.id}`),
        api.get('/appointments/my'),
        api.get('/complaints/my-complaints'),
        api.get('/notifications'),
      ]);

      if (vehiclesRes.status === 'fulfilled') {
        const data = vehiclesRes.value.data.vehicles || vehiclesRes.value.data;
        setVehicles(Array.isArray(data) ? data : []);
      }
      if (appointmentsRes.status === 'fulfilled') {
        const data = appointmentsRes.value.data.appointments || appointmentsRes.value.data;
        setAppointments(Array.isArray(data) ? data : []);
      }
      if (complaintsRes.status === 'fulfilled') {
        const data = complaintsRes.value.data;
        setComplaints(Array.isArray(data) ? data : []);
      }
      if (ordersRes.status === 'fulfilled') {
        const data = ordersRes.value.data.orders || ordersRes.value.data;
        setOrders(Array.isArray(data) ? data : []);
      }
      if (notifRes.status === 'fulfilled') {
        const data = notifRes.value.data.notifications || notifRes.value.data;
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      console.error('Failed to load user data:', error.message);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  const loadBookingData = useCallback(async () => {
    setLoadingBooking(true);
    try {
      const [agenciesRes, interventionsRes, versionsRes] = await Promise.all([
        api.get('/appointments/agencies'),
        api.get('/appointments/interventions'),
        api.get('/vehicles/catalog/versions'),
      ]);

      setAgencies(agenciesRes.data.agencies || agenciesRes.data);
      setInterventions(interventionsRes.data.interventions || interventionsRes.data);

      const versions = versionsRes.data.versions || versionsRes.data;
      const uniqueBrands = Array.from(
        new Set(versions.map((v: any) => JSON.stringify({ id: v.marque_id, nom: v.marque_nom })))
      ).map((str: any) => JSON.parse(str));
      setBrands(uniqueBrands);
      setVersionsCatalog(versions);
    } catch (error: any) {
      console.error('Failed to load booking data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de réservation');
    } finally {
      setLoadingBooking(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data.notifications || res.data;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      Alert.alert('Succès', 'Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer les notifications comme lues');
    }
  }, []);

  return (
    <DataContext.Provider value={{
      vehicles,
      appointments,
      complaints,
      orders,
      notifications,
      agencies,
      interventions,
      brands,
      versionsCatalog,
      loadingData,
      loadingBooking,
      loadUserData,
      loadBookingData,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
