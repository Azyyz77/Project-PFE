import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function AppointmentsScreen({ navigation }: any) {
  const { appointments, loadingData, loadUserData, loadBookingData } = useData();

  const statusColors: Record<string, { bg: string; text: string }> = {
    PLANIFIE:  { bg: '#DBEAFE', text: '#1E40AF' },
    CONFIRME:  { bg: '#DBEAFE', text: '#1E40AF' },
    EN_COURS:  { bg: '#FEF3C7', text: '#92400E' },
    TERMINE:   { bg: '#D1FAE5', text: '#065F46' },
    ANNULE:    { bg: '#FEE2E2', text: '#991B1B' },
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Rendez-vous</Text>
        <TouchableOpacity onPress={() => loadUserData()} disabled={loadingData}>
          <Text style={commonStyles.backButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        {loadingData ? (
          <View style={commonStyles.modernEmptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : appointments.length === 0 ? (
          <View style={commonStyles.modernEmptyState}>
            <View style={commonStyles.emptyIconCircle}>
              <Text style={commonStyles.emptyIcon}>📅</Text>
            </View>
            <Text style={commonStyles.emptyTitle}>Aucun rendez-vous</Text>
            <Text style={commonStyles.emptySubtitle}>Réservez votre premier rendez-vous de service</Text>
            <TouchableOpacity
              style={commonStyles.modernButton}
              onPress={() => { loadBookingData(); navigation.navigate('BookAppointment'); }}>
              <Text style={commonStyles.modernButtonText}>+ Réserver un RDV</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.map((apt: any, index: number) => {
            const aptDate = apt.date_heure ? new Date(apt.date_heure) : null;
            const statusStyle = statusColors[apt.statut] || statusColors.PLANIFIE;
            return (
              <View key={index} style={commonStyles.modernCard}>
                <View style={styles.aptHeader}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{aptDate ? aptDate.getDate() : '—'}</Text>
                    <Text style={styles.dateMonth}>
                      {aptDate ? aptDate.toLocaleDateString('fr-FR', { month: 'short' }) : '—'}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.aptTitle}>{apt.agence_nom}</Text>
                    <Text style={styles.aptTime}>
                      🕐 {aptDate ? aptDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{apt.statut}</Text>
                  </View>
                </View>

                <View style={styles.aptDetails}>
                  <Text style={styles.aptDetailText}>
                    🚗 {apt.marque_nom} {apt.modele_nom} · {apt.immatriculation}
                  </Text>
                </View>

                {apt.statut === 'TERMINE' && !apt.feedback_soumis && (
                  <TouchableOpacity
                    style={[commonStyles.modernButton, { backgroundColor: colors.warning, marginTop: spacing.md }]}
                    onPress={() => navigation.navigate('AppointmentFeedback', { appointment: apt })}>
                    <Text style={commonStyles.modernButtonText}>⭐ Évaluer ce rendez-vous</Text>
                  </TouchableOpacity>
                )}

                {apt.feedback_soumis && (
                  <View style={styles.feedbackBadge}>
                    <Text style={styles.feedbackBadgeText}>✓ Feedback soumis</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  aptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  dateBox: { width: 60, height: 60, borderRadius: borderRadius.md, backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  dateDay: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.textPrimary },
  dateMonth: { fontSize: fontSize.sm, color: colors.textSecondary, textTransform: 'uppercase' },
  aptTitle: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  aptTime: { fontSize: fontSize.base, color: colors.textSecondary },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.md },
  statusText: { fontSize: fontSize.xs, fontWeight: '600' },
  aptDetails: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight },
  aptDetailText: { fontSize: fontSize.base, color: colors.textSecondary },
  feedbackBadge: { backgroundColor: colors.statusCompleted.bg, padding: spacing.md, borderRadius: borderRadius.sm, marginTop: spacing.md },
  feedbackBadgeText: { color: colors.statusCompleted.text, fontSize: fontSize.base, fontWeight: '600', textAlign: 'center' },
});
