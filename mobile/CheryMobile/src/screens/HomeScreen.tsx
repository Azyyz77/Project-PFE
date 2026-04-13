import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

interface HomeScreenProps {
  user: any;
  vehicles: any[];
  appointments: any[];
  complaints: any[];
  orders: any[];
  notifications: any[];
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onLoadBookingData: () => void;
}

export default function HomeScreen({
  user,
  vehicles,
  appointments,
  complaints,
  orders,
  notifications,
  onNavigate,
  onLogout,
  onLoadBookingData,
}: HomeScreenProps) {
  const unreadNotifications = notifications.filter((n: any) => !n.lu).length;

  return (
    <View style={commonStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Modern Welcome Banner */}
        <View style={styles.modernBanner}>
          <View style={styles.bannerContent}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerGreeting}>Bienvenue, {user?.prenom}! 👋</Text>
              <Text style={styles.bannerSubtext}>Gérez vos véhicules et rendez-vous</Text>
            </View>
          </View>
          
          {/* Quick Stats */}
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
              <Text style={styles.statLabel}>Notifications</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: spacing.xl }}>
          {/* Quick Action Cards */}
          <View style={styles.actionCardsContainer}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.success }]}
              onPress={() => {
                onLoadBookingData();
                onNavigate('bookAppointment');
              }}
            >
              <Text style={styles.actionCardIcon}>📅</Text>
              <Text style={styles.actionCardTitle}>Réserver un RDV</Text>
              <Text style={styles.actionCardSubtitle}>Planifiez votre service</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.primary }]}
              onPress={() => {
                onLoadBookingData();
                onNavigate('addVehicle');
              }}
            >
              <Text style={styles.actionCardIcon}>🚗</Text>
              <Text style={styles.actionCardTitle}>Ajouter véhicule</Text>
              <Text style={styles.actionCardSubtitle}>Enregistrez un nouveau</Text>
            </TouchableOpacity>
          </View>

          {/* Service Menu Grid */}
          <Text style={commonStyles.sectionTitle}>Services</Text>
          <View style={styles.serviceGrid}>
            <ServiceCard
              icon="🚗"
              title="Véhicules"
              count={vehicles.length}
              bgColor={colors.purple}
              onPress={() => onNavigate('vehicles')}
            />
            <ServiceCard
              icon="📅"
              title="Rendez-vous"
              count={appointments.length}
              bgColor={colors.blue}
              onPress={() => onNavigate('appointments')}
            />
            <ServiceCard
              icon="📝"
              title="Réclamations"
              count={complaints.length}
              bgColor={colors.yellow}
              onPress={() => onNavigate('complaints')}
            />
            <ServiceCard
              icon="🔧"
              title="Commandes"
              count={orders.length}
              bgColor={colors.green}
              onPress={() => onNavigate('orders')}
            />
            <ServiceCard
              icon="🔔"
              title="Notifications"
              count={notifications.length}
              bgColor={colors.orange}
              badge={unreadNotifications}
              onPress={() => onNavigate('notifications')}
            />
            <ServiceCard
              icon="👤"
              title="Profil"
              count="—"
              bgColor={colors.indigo}
              onPress={() => onNavigate('profile')}
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.modernLogoutButton} onPress={onLogout}>
            <Text style={styles.modernLogoutText}>🚪 Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Service Card Component
interface ServiceCardProps {
  icon: string;
  title: string;
  count: number | string;
  bgColor: string;
  badge?: number;
  onPress: () => void;
}

function ServiceCard({ icon, title, count, bgColor, badge, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
      <View style={[styles.serviceIconContainer, { backgroundColor: bgColor }]}>
        <Text style={styles.serviceIcon}>{icon}</Text>
        {badge !== undefined && badge > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceCount}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modernBanner: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    color: colors.textWhite,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  bannerGreeting: {
    color: colors.textWhite,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  bannerSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: fontSize.base,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.textWhite,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  actionCardsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: -40,
    marginBottom: spacing.xxl,
  },
  actionCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  actionCardIcon: {
    fontSize: fontSize.xxxl,
    marginBottom: spacing.sm,
  },
  actionCardTitle: {
    color: colors.textWhite,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: fontSize.sm,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  serviceCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  serviceIconContainer: {
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
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: colors.textWhite,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  serviceTitle: {
    fontSize: fontSize.sm + 1,
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
  modernLogoutButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
    marginBottom: 40,
  },
  modernLogoutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
