import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

interface AppointmentsScreenProps {
  appointments: any[];
  loadingData: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onBookAppointment: () => void;
  onFeedback: (appointment: any) => void;
}

export default function AppointmentsScreen({
  appointments,
  loadingData,
  onBack,
  onRefresh,
  onBookAppointment,
  onFeedback,
}: AppointmentsScreenProps) {
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Rendez-vous</Text>
        <TouchableOpacity onPress={onRefresh} disabled={loadingData}>
          <Text style={commonStyles.backButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.xl }}>
        {loadingData ? (
          <View style={commonStyles.modernEmptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={commonStyles.emptySubtitle}>Chargement...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={commonStyles.modernEmptyState}>
            <View style={commonStyles.emptyIconCircle}>
              <Text style={commonStyles.emptyIcon}>📅</Text>
            </View>
            <Text style={commonStyles.emptyTitle}>Aucun rendez-vous</Text>
            <Text style={commonStyles.emptySubtitle}>
              Réservez votre premier rendez-vous de service
            </Text>
            <TouchableOpacity style={commonStyles.modernButton} onPress={onBookAppointment}>
              <Text style={commonStyles.modernButtonText}>+ Réserver un RDV</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.map((apt, index) => {
            const aptDate = apt.date_heure ? new Date(apt.date_heure) : null;
            const statusColors: Record<string, { bg: string; text: string }> = {
              PLANIFIE: colors.statusPlanned,
              CONFIRME: colors.statusPlanned,
              EN_COURS: colors.statusInProgress,
              TERMINE: colors.statusCompleted,
              ANNULE: colors.statusCancelled,
            };
            const statusStyle = statusColors[apt.statut] || colors.statusPlanned;
            
            return (
              <View key={index} style={commonStyles.modernCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentDateBox}>
                    <Text style={styles.appointmentDay}>
                      {aptDate ? aptDate.getDate() : '—'}
                    </Text>
                    <Text style={styles.appointmentMonth}>
                      {aptDate ? aptDate.toLocaleDateString('fr-FR', { month: 'short' }) : '—'}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.appointmentTitle}>{apt.agence_nom}</Text>
                    <Text style={styles.appointmentTime}>
                      🕐 {aptDate ? aptDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Heure non définie'}
                    </Text>
                  </View>
                  <View style={[styles.appointmentStatusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.appointmentStatusText, { color: statusStyle.text }]}>
                      {apt.statut}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.appointmentDetails}>
                  <View style={styles.appointmentDetailRow}>
                    <Text style={styles.appointmentDetailIcon}>🚗</Text>
                    <Text style={styles.appointmentDetailText}>
                      {apt.marque_nom} {apt.modele_nom} • {apt.immatriculation}
                    </Text>
                  </View>
                </View>
                
                {apt.statut === 'TERMINE' && !apt.feedback_soumis && (
                  <TouchableOpacity
                    style={[commonStyles.modernButton, { backgroundColor: colors.warning, marginTop: spacing.md }]}
                    onPress={() => onFeedback(apt)}
                  >
                    <Text style={commonStyles.modernButtonText}>⭐ Évaluer ce rendez-vous</Text>
                  </TouchableOpacity>
                )}
                
                {apt.feedback_soumis && (
                  <View style={styles.feedbackSubmittedBadge}>
                    <Text style={styles.feedbackSubmittedText}>✓ Feedback soumis</Text>
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
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appointmentDateBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentDay: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  appointmentMonth: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  appointmentTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  appointmentStatusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  appointmentStatusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  appointmentDetails: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  appointmentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentDetailIcon: {
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  appointmentDetailText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  feedbackSubmittedBadge: {
    backgroundColor: colors.statusCompleted.bg,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  feedbackSubmittedText: {
    color: colors.statusCompleted.text,
    fontSize: fontSize.sm + 1,
    fontWeight: '600',
    textAlign: 'center',
  },
});
