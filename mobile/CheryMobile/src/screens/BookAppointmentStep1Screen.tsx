import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useData } from '../context/DataContext';
import { FacebookButton, FacebookCard, FacebookEmptyState } from '../components/facebook';

export default function BookAppointmentStep1Screen({ navigation, route }: any) {
  const { vehicles, agencies, interventions, loadingBooking, loadBookingData } = useData();
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [selectedInterventionId, setSelectedInterventionId] = useState('');
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    loadBookingData();
    // Load packages from API if needed
  }, []);

  // Restore previous selections if coming back
  useEffect(() => {
    if (route.params?.selectedVehicleId) setSelectedVehicleId(route.params.selectedVehicleId);
    if (route.params?.selectedAgencyId) setSelectedAgencyId(route.params.selectedAgencyId);
    if (route.params?.selectedInterventionId) setSelectedInterventionId(route.params.selectedInterventionId);
    if (route.params?.selectedPackageIds) setSelectedPackageIds(route.params.selectedPackageIds);
  }, [route.params]);

  const validVehicles = vehicles.filter((v: any) => v.statut_validation === 'VALIDE');

  const togglePackage = (packageId: number) => {
    setSelectedPackageIds(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleNext = () => {
    if (!selectedVehicleId || !selectedAgencyId || !selectedInterventionId) {
      return;
    }

    navigation.navigate('BookAppointmentStep2', {
      selectedVehicleId,
      selectedAgencyId,
      selectedInterventionId,
      selectedPackageIds,
    });
  };

  const canProceed = selectedVehicleId && selectedAgencyId && selectedInterventionId;

  if (loadingBooking) {
    return (
      <Modal visible={true} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (validVehicles.length === 0) {
    return (
      <Modal visible={true} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>Réserver un rendez-vous</Text>
              <Text style={styles.modalSubtitle}>Étape 1 sur 3</Text>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, flex: 1 }}>
            <FacebookEmptyState
              icon={<Text style={{ fontSize: 48 }}>⚠️</Text>}
              title="Aucun véhicule validé"
              description="Ajoutez un véhicule et attendez la validation pour réserver."
              actionLabel="Ajouter un véhicule"
              onAction={() => {
                navigation.goBack();
                navigation.navigate('AddVehicle');
              }}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }

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
            <Text style={styles.modalSubtitle}>Étape 1 sur 3</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={styles.progressBar} />
          <View style={styles.progressBar} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Agence */}
          <Text style={styles.sectionLabel}>Agence *</Text>
          <View style={styles.selectContainer}>
            {agencies.length > 0 ? (
              agencies.map((a: any) => (
                <TouchableOpacity 
                  key={a.id}
                  style={[
                    styles.selectOption, 
                    selectedAgencyId === String(a.id) && styles.selectOptionSelected
                  ]}
                  onPress={() => setSelectedAgencyId(String(a.id))}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.selectOptionText, 
                      selectedAgencyId === String(a.id) && styles.selectOptionTextSelected
                    ]}>
                      {a.nom}
                    </Text>
                    <Text style={styles.selectOptionSubtext}>{a.ville}</Text>
                  </View>
                  {selectedAgencyId === String(a.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.placeholderText}>Sélectionner une agence</Text>
            )}
          </View>

          {/* Véhicule */}
          <Text style={styles.sectionLabel}>Véhicule *</Text>
          <View style={styles.selectContainer}>
            {validVehicles.map((v: any) => (
              <TouchableOpacity 
                key={v.id}
                style={[
                  styles.selectOption, 
                  selectedVehicleId === String(v.id) && styles.selectOptionSelected
                ]}
                onPress={() => setSelectedVehicleId(String(v.id))}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.selectOptionText, 
                    selectedVehicleId === String(v.id) && styles.selectOptionTextSelected
                  ]}>
                    {v.marque} {v.modele}
                  </Text>
                  <Text style={styles.selectOptionSubtext}>{v.immatriculation}</Text>
                </View>
                {selectedVehicleId === String(v.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Type de service */}
          <Text style={styles.sectionLabel}>Type de service *</Text>
          <View style={styles.selectContainer}>
            {interventions.map((type: any) =>
              type.sous_types?.map((sub: any) => (
                <TouchableOpacity 
                  key={sub.id}
                  style={[
                    styles.selectOption, 
                    selectedInterventionId === String(sub.id) && styles.selectOptionSelected
                  ]}
                  onPress={() => setSelectedInterventionId(String(sub.id))}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.selectOptionText, 
                      selectedInterventionId === String(sub.id) && styles.selectOptionTextSelected
                    ]}>
                      {type.nom}
                    </Text>
                    <Text style={styles.selectOptionSubtext}>{sub.nom}</Text>
                  </View>
                  {selectedInterventionId === String(sub.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Packages disponibles (optional) */}
          {packages.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Packages disponibles</Text>
              <View style={styles.packagesContainer}>
                {packages.map((pkg: any) => (
                  <TouchableOpacity 
                    key={pkg.id}
                    style={[
                      styles.packageCard,
                      selectedPackageIds.includes(pkg.id) && styles.packageCardSelected
                    ]}
                    onPress={() => togglePackage(pkg.id)}
                  >
                    <View style={styles.packageHeader}>
                      <Text style={styles.packageIcon}>🎁</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.packageName}>{pkg.nom}</Text>
                        <Text style={styles.packageDescription}>{pkg.description}</Text>
                      </View>
                      <Text style={styles.packagePrice}>{pkg.prix.toFixed(3)} TND</Text>
                    </View>
                    {selectedPackageIds.includes(pkg.id) && (
                      <View style={styles.packageSelected}>
                        <Text style={styles.packageSelectedText}>✓ Sélectionné</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.bottomBar}>
          <FacebookButton
            title="Continuer"
            onPress={handleNext}
            disabled={!canProceed}
            fullWidth
            variant="primary"
            size="large"
            icon={<Text style={{ color: colors.textWhite, fontSize: 18 }}>→</Text>}
          />
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  selectContainer: {
    gap: spacing.sm,
  },
  selectOption: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  selectOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  selectOptionText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  selectOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  selectOptionSubtext: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    padding: spacing.lg,
    textAlign: 'center',
  },
  packagesContainer: {
    gap: spacing.md,
  },
  packageCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  packageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  packageIcon: {
    fontSize: 24,
  },
  packageName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  packageDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  packagePrice: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  packageSelected: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  packageSelectedText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
