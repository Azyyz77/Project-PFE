import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';

interface SimpleSidebarProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

interface MenuItem {
  icon: string;
  label: string;
  screen: string;
  badge?: number;
}

export default function SimpleSidebar({ visible, onClose, navigation }: SimpleSidebarProps) {
  const { user, logout } = useAuth();
  const { vehicles, appointments, notifications } = useData();

  const unreadNotifications = notifications.filter((n: any) => !n.lu).length;

  const menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Accueil', screen: 'Home' },
    { icon: '🚗', label: 'Mes Véhicules', screen: 'Vehicles', badge: vehicles.length },
    { icon: '📅', label: 'Rendez-vous', screen: 'Appointments', badge: appointments.length },
    { icon: '🔧', label: 'Commandes', screen: 'RepairOrders' },
    { icon: '💰', label: 'Factures', screen: 'Invoices' },
    { icon: '📝', label: 'Réclamations', screen: 'Complaints' },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications', badge: unreadNotifications },
    { icon: '💬', label: 'Assistant SAV', screen: 'Chatbot' },
    { icon: '👤', label: 'Mon Profil', screen: 'Profile' },
  ];

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const navigateToScreen = (screen: string) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Overlay touchable pour fermer */}
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Profile Section */}
            <View style={styles.header}>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </Text>
                  </View>
                  <View style={styles.statusIndicator} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user?.prenom} {user?.nom}
                  </Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>👤 Client</Text>
                  </View>
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{vehicles.length}</Text>
                  <Text style={styles.statLabel}>Véhicules</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{appointments.length}</Text>
                  <Text style={styles.statLabel}>RDV</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{unreadNotifications}</Text>
                  <Text style={styles.statLabel}>Alertes</Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>MENU PRINCIPAL</Text>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => navigateToScreen(item.screen)}
                  activeOpacity={0.7}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  {item.badge !== undefined && item.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigateToScreen('BookAppointmentStep1')}
                activeOpacity={0.8}>
                <Text style={styles.quickActionIcon}>📅</Text>
                <Text style={styles.quickActionText}>Réserver un RDV</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.success }]}
                onPress={() => navigateToScreen('AddVehicle')}
                activeOpacity={0.8}>
                <Text style={styles.quickActionIcon}>🚗</Text>
                <Text style={styles.quickActionText}>Ajouter un véhicule</Text>
              </TouchableOpacity>
            </View>

            {/* Footer - Logout */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Déconnexion</Text>
              </TouchableOpacity>
              <Text style={styles.version}>Version 1.0.0</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    width: '85%',
    backgroundColor: colors.background,
    ...shadows.lg,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  userInfo: {
    marginTop: spacing.sm,
  },
  userName: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.sm,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  quickActionText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.error,
    marginBottom: spacing.md,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
});
