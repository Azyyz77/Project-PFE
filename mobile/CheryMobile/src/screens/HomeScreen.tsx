import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';
import SimpleSidebar from '../components/SimpleSidebar';
import { FacebookCard, FacebookButton, FacebookStatCard } from '../components/facebook';

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
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header Banner - Facebook Style */}
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
        </View>

        <View style={styles.contentContainer}>
          {/* Stats Cards - Facebook Style */}
          <View style={styles.statsRow}>
            <View style={{ flex: 1 }}>
              <FacebookStatCard
                icon={<Text style={{ fontSize: 20 }}>🚗</Text>}
                label="Véhicules"
                value={vehicles.length}
                iconColor={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FacebookStatCard
                icon={<Text style={{ fontSize: 20 }}>📅</Text>}
                label="Rendez-vous"
                value={appointments.length}
                iconColor={colors.success}
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={{ flex: 1 }}>
              <FacebookStatCard
                icon={<Text style={{ fontSize: 20 }}>🔔</Text>}
                label="Notifications"
                value={unreadNotifications}
                iconColor={colors.warning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FacebookStatCard
                icon={<Text style={{ fontSize: 20 }}>💰</Text>}
                label="Factures"
                value="—"
                iconColor={colors.info}
              />
            </View>
          </View>

          {/* Quick Actions - Facebook Style */}
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionRow}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <FacebookCard noPadding>
                <TouchableOpacity
                  style={styles.actionCardContent}
                  onPress={() => { loadBookingData(); navigation.navigate('BookAppointmentStep1'); }}>
                  <Text style={styles.actionIcon}>📅</Text>
                  <Text style={styles.actionTitle}>Réserver un RDV</Text>
                  <Text style={styles.actionSub}>Planifiez votre service</Text>
                </TouchableOpacity>
              </FacebookCard>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <FacebookCard noPadding>
                <TouchableOpacity
                  style={styles.actionCardContent}
                  onPress={() => { loadBookingData(); navigation.navigate('AddVehicle'); }}>
                  <Text style={styles.actionIcon}>🚗</Text>
                  <Text style={styles.actionTitle}>Ajouter véhicule</Text>
                  <Text style={styles.actionSub}>Enregistrez un nouveau</Text>
                </TouchableOpacity>
              </FacebookCard>
            </View>
          </View>

          {/* Service Grid - Facebook Style */}
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.serviceGrid}>
            {serviceCards.map((card) => (
              <View key={card.screen} style={{ width: '31%' }}>
                <FacebookCard noPadding>
                  <TouchableOpacity
                    style={styles.serviceCardContent}
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
                </FacebookCard>
              </View>
            ))}
          </View>

          {/* Logout Button - Facebook Style */}
          <FacebookButton
            title="🚪 Déconnexion"
            onPress={handleLogout}
            variant="outline"
            fullWidth
          />
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
  scrollView: {
    backgroundColor: colors.background,
  },
  banner: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  greeting: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  subgreeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.base,
    marginTop: 4,
  },
  contentContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  actionCardContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: fontSize.xxxl,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSub: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  serviceCardContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  serviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  serviceIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  serviceTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceCount: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
