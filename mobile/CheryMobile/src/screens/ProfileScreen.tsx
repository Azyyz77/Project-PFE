import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const infoRows = [
    { icon: '👤', label: 'Nom', value: user?.nom },
    { icon: '✨', label: 'Prénom', value: user?.prenom },
    { icon: '📧', label: 'Email', value: user?.email },
    { icon: '📱', label: 'Téléphone', value: user?.telephone },
    { icon: '🔑', label: 'Rôle', value: user?.role },
  ];

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Mon Profil</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.prenom?.[0]}{user?.nom?.[0]}</Text>
          </View>
          <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          {infoRows.map((row, i) => (
            <View key={i} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoIcon}>{row.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value || '—'}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>🚪 Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarCard: {
    backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    padding: spacing.xxl, alignItems: 'center', marginBottom: spacing.xl,
    ...shadows.lg,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { color: '#fff', fontSize: fontSize.xxxl, fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: fontSize.xxl, fontWeight: 'bold' },
  userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.base, marginTop: 4 },
  infoCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginBottom: spacing.xl,
    ...shadows.sm,
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoIcon: { fontSize: 20, marginRight: spacing.md, width: 30 },
  infoLabel: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 2 },
  infoValue: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '500' },
  logoutBtn: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.lg, alignItems: 'center',
    borderWidth: 2, borderColor: colors.error, marginBottom: 40,
  },
  logoutText: { color: colors.error, fontSize: fontSize.md, fontWeight: '600' },
});
