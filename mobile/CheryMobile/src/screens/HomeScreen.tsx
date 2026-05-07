import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';
import SimpleSidebar from '../components/SimpleSidebar';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { vehicles, appointments, notifications, loadBookingData } = useData();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const unreadNotifications = notifications.filter((n: any) => !n.lu).length;

  const handleLogout = async () => {
    await logout();
  };

  const serviceCards = [
    { icon: '🚗', title: 'Véhicules',      count: vehicles.length,     bg: colors.purple, screen: 'Vehicles' },
    { icon: '📅', title: 'Rendez-vous',    count: appointments.length, bg: colors.blue,   screen: 'Appointments' },
    { icon: '📝', title: 'Réclamations',   count: null,                bg: colors.yellow, screen: 'Complaints' },
    { icon: '🔧', title: 'Commandes',      count: null,                bg: colors.green,  screen: 'RepairOrders' },
    { icon: '💰', title: 'Factures',       count: null,                bg: colors.teal,   screen: 'Invoices' },
    { icon: '🔔', title: 'Notifications',  count: notifications.length, bg: colors.orange, screen: 'Notifications', badge: unreadNotifications },
    { icon: '💬', title: 'Assistant SAV',  count: null,                bg: colors.blue,   screen: 'Chatbot' },
    { icon: '👤', title: 'Profil',         count: null,                bg: colors.indigo, screen: 'Profile' },
  ];

  return (
    <View style={commonStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <View style={styles.banner}>
          {/* Menu Button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setSidebarVisible(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.bannerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.prenom?.[0]}{user?.nom?.[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Bienvenue, {user?.prenom}! 👋</Text>
              <Text style={styles.subgreeting}>Gérez vos véhicules et rendez-vous</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{vehicles.length}</Text>
              <Text style={styles.statLabel}>Véhicules</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{appointments.length}</Text>
              <Text style={styles.statLabel}>RDV</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{unreadNotifications}</Text>
              <Text style={styles.statLabel}>Non lues</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: spacing.xl }}>
          {/* Quick Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.success }]}
              onPress={() => { loadBookingData(); navigation.navigate('BookAppointment'); }}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionTitle}>Réserver un RDV</Text>
              <Text style={styles.actionSub}>Planifiez votre service</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.primary }]}
              onPress={() => { loadBookingData(); navigation.navigate('AddVehicle'); }}>
              <Text style={styles.actionIcon}>🚗</Text>
              <Text style={styles.actionTitle}>Ajouter véhicule</Text>
              <Text style={styles.actionSub}>Enregistrez un nouveau</Text>
            </TouchableOpacity>
          </View>

          {/* Service Grid */}
          <Text style={commonStyles.sectionTitle}>Services</Text>
          <View style={styles.serviceGrid}>
            {serviceCards.map((card) => (
              <TouchableOpacity
                key={card.screen}
                style={styles.serviceCard}
                onPress={() => navigation.navigate(card.screen)}>
                <View style={[styles.serviceIconWrap, { backgroundColor: card.bg }]}>
                  <Text style={styles.serviceIcon}>{card.icon}</Text>
                  {card.badge !== undefined && card.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{card.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.serviceTitle}>{card.title}</Text>
                <Text style={styles.serviceCount}>
                  {card.count !== null ? card.count : '—'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Simple Sidebar */}
      <SimpleSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary, paddingTop: 60,
    paddingBottom: 30, paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  bannerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.lg, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { color: '#fff', fontSize: fontSize.xxl, fontWeight: 'bold' },
  greeting: { color: '#fff', fontSize: fontSize.xxl, fontWeight: 'bold' },
  subgreeting: { color: 'rgba(255,255,255,0.9)', fontSize: fontSize.base, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center' },
  statNumber: { color: '#fff', fontSize: fontSize.xxl, fontWeight: 'bold' },
  statLabel: { color: 'rgba(255,255,255,0.9)', fontSize: fontSize.xs, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginTop: -40, marginBottom: spacing.xxl },
  actionCard: { flex: 1, borderRadius: borderRadius.lg, padding: spacing.xl, ...shadows.lg },
  actionIcon: { fontSize: fontSize.xxxl, marginBottom: spacing.sm },
  actionTitle: { color: '#fff', fontSize: fontSize.md, fontWeight: 'bold', marginBottom: 4 },
  actionSub: { color: 'rgba(255,255,255,0.9)', fontSize: fontSize.sm },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xxl },
  serviceCard: { width: '31%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', ...shadows.sm },
  serviceIconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, position: 'relative' },
  serviceIcon: { fontSize: 28 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.error, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#fff', fontSize: fontSize.xs, fontWeight: 'bold' },
  serviceTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  serviceCount: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.primary },
  logoutBtn: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: colors.error, marginBottom: 40 },
  logoutText: { color: colors.error, fontSize: fontSize.md, fontWeight: '600' },
});
