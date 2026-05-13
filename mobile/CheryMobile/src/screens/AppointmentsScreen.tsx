import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { FacebookCard, FacebookBadge, FacebookEmptyState, FacebookButton } from '../components/facebook';

export default function AppointmentsScreen({ navigation }: any) {
  const { appointments, loadingData, loadUserData, loadBookingData } = useData();

  const getStatusVariant = (statut: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (statut) {
      case 'TERMINE': return 'success';
      case 'EN_COURS': return 'warning';
      case 'ANNULE': return 'error';
      default: return 'info';
    }
  };

  const getStatusLabel = (statut: string): string => {
    switch (statut) {
      case 'PLANIFIE': return 'Planifié';
      case 'CONFIRME': return 'Confirmé';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rendez-vous</Text>
        <TouchableOpacity onPress={() => loadUserData()} disabled={loadingData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <FacebookEmptyState
            icon={<Text style={{ fontSize: 48 }}>📅</Text>}
            title="Aucun rendez-vous"
            description="Réservez votre premier rendez-vous de service"
            actionLabel="+ Réserver un RDV"
            onAction={() => { loadBookingData(); navigation.navigate('BookAppointmentStep1'); }}
          />
        ) : (
          <>
            {appointments.map((apt: any, index: number) => {
              const aptDate = apt.date_heure ? new Date(apt.date_heure) : null;
              
              return (
                <FacebookCard key={index} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateDay}>{aptDate ? aptDate.getDate() : '—'}</Text>
                      <Text style={styles.dateMonth}>
                        {aptDate ? aptDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase() : '—'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={styles.appointmentTitle}>{apt.agence_nom}</Text>
                      <Text style={styles.appointmentTime}>
                        🕐 {aptDate ? aptDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </Text>
                    </View>
                    <FacebookBadge
                      label={getStatusLabel(apt.statut)}
                      variant={getStatusVariant(apt.statut)}
                    />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>VÉHICULE</Text>
                      <Text style={styles.detailValue}>
                        {apt.marque_nom} {apt.modele_nom}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>IMMATRICULATION</Text>
                      <Text style={styles.detailValue}>{apt.immatriculation}</Text>
                    </View>
                  </View>

                  {apt.statut === 'TERMINE' && !apt.feedback_soumis && (
                    <View style={styles.feedbackSection}>
                      <FacebookButton
                        title="⭐ Évaluer ce rendez-vous"
                        onPress={() => navigation.navigate('AppointmentFeedback', { appointment: apt })}
                        variant="primary"
                        fullWidth
                        size="medium"
                      />
                    </View>
                  )}

                  {apt.feedback_soumis && (
                    <View style={styles.feedbackBadge}>
                      <Text style={styles.feedbackBadgeText}>✓ Feedback soumis</Text>
                    </View>
                  )}
                </FacebookCard>
              );
            })}

            {/* Add Appointment Button */}
            <FacebookButton
              title="+ Réserver un RDV"
              onPress={() => { loadBookingData(); navigation.navigate('BookAppointmentStep1'); }}
              variant="outline"
              fullWidth
              size="large"
            />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  refreshButton: {
    padding: spacing.sm,
  },
  refreshButtonText: {
    fontSize: fontSize.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  appointmentCard: {
    marginBottom: spacing.lg,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  dateMonth: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appointmentTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  appointmentTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  appointmentDetails: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  feedbackSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackBadge: {
    backgroundColor: colors.statusCompleted.bg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackBadgeText: {
    color: colors.statusCompleted.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
});
