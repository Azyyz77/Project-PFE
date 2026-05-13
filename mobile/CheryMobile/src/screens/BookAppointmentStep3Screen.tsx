import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useData } from '../context/DataContext';
import api from '../config/api';
import { FacebookButton, FacebookCard } from '../components/facebook';
import { TextInput } from 'react-native';

export default function BookAppointmentStep3Screen({ navigation, route }: any) {
  const { 
    selectedVehicleId, 
    selectedAgencyId, 
    selectedInterventionId,
    selectedDate,
    selectedTime 
  } = route.params;

  const { vehicles, agencies, interventions, loadUserData } = useData();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedVehicle = vehicles.find((v: any) => String(v.id) === selectedVehicleId);
  const selectedAgency = agencies.find((a: any) => String(a.id) === selectedAgencyId);
  
  let selectedIntervention: any = null;
  for (const type of interventions) {
    const sub = type.sous_types?.find((s: any) => String(s.id) === selectedInterventionId);
    if (sub) {
      selectedIntervention = { type: type.nom, subType: sub.nom };
      break;
    }
  }

  const handleBack = () => {
    navigation.navigate('BookAppointmentStep2', {
      selectedVehicleId,
      selectedAgencyId,
      selectedInterventionId,
      selectedDate,
      selectedTime,
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post('/appointments', {
        vehicule_id: Number(selectedVehicleId),
        agence_id: Number(selectedAgencyId),
        date_heure: `${selectedDate}T${selectedTime}:00`,
        description: notes || undefined,
        sous_type_ids: [Number(selectedInterventionId)],
      });

      Alert.alert(
        'Succès',
        'Rendez-vous réservé avec succès !',
        [
          {
            text: 'OK',
            onPress: () => {
              loadUserData();
              navigation.navigate('Appointments');
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible de réserver'
      );
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = selectedDate 
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : '';

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.modalTitle}>Réserver un rendez-vous</Text>
            <Text style={styles.modalSubtitle}>Étape 3 sur 3</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <FacebookCard style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Récapitulatif de votre rendez-vous</Text>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🚗</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>VÉHICULE</Text>
                <Text style={styles.summaryValue}>
                  {selectedVehicle?.marque} {selectedVehicle?.modele}
                </Text>
                <Text style={styles.summarySubvalue}>
                  {selectedVehicle?.immatriculation}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🏢</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>AGENCE</Text>
                <Text style={styles.summaryValue}>{selectedAgency?.nom}</Text>
                <Text style={styles.summarySubvalue}>{selectedAgency?.ville}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🔧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>INTERVENTION</Text>
                <Text style={styles.summaryValue}>{selectedIntervention?.type}</Text>
                <Text style={styles.summarySubvalue}>{selectedIntervention?.subType}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>DATE ET HEURE</Text>
                <Text style={styles.summaryValue}>{formattedDate}</Text>
                <Text style={styles.summarySubvalue}>à {selectedTime}</Text>
              </View>
            </View>
          </FacebookCard>

          {/* Notes */}
          <Text style={styles.sectionLabel}>Notes (optionnel)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Informations supplémentaires..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Info Banner */}
          <FacebookCard style={styles.infoBanner}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Vous recevrez une confirmation par WhatsApp une fois votre rendez-vous validé par l'agence.
            </Text>
          </FacebookCard>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View style={styles.bottomBar}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} disabled={loading}>
              <Text style={styles.backBtnText}>← Retour</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <FacebookButton
                title="Confirmer"
                onPress={handleConfirm}
                loading={loading}
                disabled={loading}
                fullWidth
                variant="primary"
                size="large"
                icon={<Text style={{ color: colors.textWhite, fontSize: 18 }}>✓</Text>}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalHeader: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: colors.textWhite,
    fontSize: 24,
    fontWeight: '600',
  },
  headerContent: {
    marginTop: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
  },
  progressBarActive: {
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  summaryCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  summaryIcon: {
    fontSize: 24,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  summarySubvalue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minHeight: 100,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    lineHeight: 20,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
