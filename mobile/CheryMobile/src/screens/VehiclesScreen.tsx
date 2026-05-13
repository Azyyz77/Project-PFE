import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { FacebookCard, FacebookBadge, FacebookEmptyState, FacebookButton } from '../components/facebook';

export default function VehiclesScreen({ navigation }: any) {
  const { vehicles, loadingData, loadUserData, loadBookingData } = useData();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Véhicules</Text>
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
        ) : vehicles.length === 0 ? (
          <FacebookEmptyState
            icon={<Text style={{ fontSize: 48 }}>🚗</Text>}
            title="Aucun véhicule"
            description="Ajoutez votre premier véhicule pour commencer à utiliser nos services"
            actionLabel="+ Ajouter un véhicule"
            onAction={() => { loadBookingData(); navigation.navigate('AddVehicle'); }}
          />
        ) : (
          <>
            {vehicles.map((vehicle: any, index: number) => (
              <FacebookCard key={index} style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleIconCircle}>
                    <Text style={styles.vehicleIcon}>🚗</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vehicleTitle}>
                      {vehicle.marque} {vehicle.modele}
                    </Text>
                    <Text style={styles.vehicleImmat}>{vehicle.immatriculation}</Text>
                  </View>
                  {vehicle.statut_validation && (
                    <FacebookBadge
                      label={vehicle.statut_validation === 'VALIDE' ? 'Validé' : 'En attente'}
                      variant={vehicle.statut_validation === 'VALIDE' ? 'success' : 'warning'}
                    />
                  )}
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsContainer}>
                  {vehicle.annee && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ANNÉE</Text>
                      <Text style={styles.detailValue}>{vehicle.annee}</Text>
                    </View>
                  )}
                  {vehicle.couleur && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>COULEUR</Text>
                      <Text style={styles.detailValue}>{vehicle.couleur}</Text>
                    </View>
                  )}
                  {vehicle.kilometrage && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>KILOMÉTRAGE</Text>
                      <Text style={styles.detailValue}>{vehicle.kilometrage} km</Text>
                    </View>
                  )}
                  {vehicle.numero_chassis && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>CHÂSSIS</Text>
                      <Text style={styles.detailValue}>{vehicle.numero_chassis}</Text>
                    </View>
                  )}
                </View>
              </FacebookCard>
            ))}

            {/* Add Vehicle Button */}
            <FacebookButton
              title="+ Ajouter un véhicule"
              onPress={() => { loadBookingData(); navigation.navigate('AddVehicle'); }}
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
  vehicleCard: {
    marginBottom: spacing.lg,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  vehicleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  vehicleIcon: {
    fontSize: 28,
  },
  vehicleTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  vehicleImmat: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  detailsContainer: {
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
});
