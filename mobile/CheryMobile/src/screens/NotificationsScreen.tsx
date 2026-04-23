import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function NotificationsScreen({ navigation }: any) {
  const { notifications, loadingData, markNotificationRead, markAllNotificationsRead, loadUserData } = useData();

  const unreadCount = notifications.filter((n: any) => !n.lu).length;

  return (
    <View style={styles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => loadUserData()} disabled={loadingData}>
          <Text style={commonStyles.backButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllNotificationsRead}>
          <Text style={styles.markAllText}>✓ Tout marquer comme lu ({unreadCount})</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        {loadingData ? (
          <View style={commonStyles.modernEmptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={commonStyles.modernEmptyState}>
            <View style={commonStyles.emptyIconCircle}><Text style={commonStyles.emptyIcon}>🔔</Text></View>
            <Text style={commonStyles.emptyTitle}>Aucune notification</Text>
            <Text style={commonStyles.emptySubtitle}>Vous serez notifié ici pour toute activité sur votre compte.</Text>
          </View>
        ) : (
          notifications.map((notif: any) => {
            const notifDate = notif.date_envoi ? new Date(notif.date_envoi) : null;
            return (
              <TouchableOpacity
                key={notif.id || `${notif.titre}-${notif.date_envoi}`}
                style={[styles.card, !notif.lu && styles.cardUnread]}
                onPress={() => !notif.lu && markNotificationRead(notif.id)}
                activeOpacity={notif.lu ? 1 : 0.7}>
                <View style={styles.cardInner}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.notifIcon}>{notif.lu ? '🔔' : '🔵'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, !notif.lu && styles.cardTitleUnread]} numberOfLines={1}>
                        {notif.titre}
                      </Text>
                      {!notif.lu && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.cardMessage} numberOfLines={2}>{notif.message}</Text>
                    {notifDate && (
                      <Text style={styles.cardDate}>
                        {notifDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à{' '}
                        {notifDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </View>
                </View>
                {!notif.lu && (
                  <Text style={styles.tapToRead}>Appuyer pour marquer comme lu</Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  markAllBtn: {
    backgroundColor: colors.success, margin: spacing.lg,
    padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center',
  },
  markAllText: { color: '#fff', fontWeight: '600', fontSize: fontSize.base },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  cardUnread: { borderColor: colors.primary, backgroundColor: '#EFF6FF', borderLeftWidth: 4 },
  cardInner: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { marginRight: spacing.md, marginTop: 2 },
  notifIcon: { fontSize: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' },
  cardTitleUnread: { fontWeight: '700', color: colors.textPrimary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.xs },
  cardMessage: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  cardDate: { fontSize: fontSize.xs, color: colors.textMuted },
  tapToRead: { fontSize: fontSize.xs, color: colors.primary, marginTop: spacing.xs, fontStyle: 'italic' },
});
