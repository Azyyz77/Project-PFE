import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

interface VehiclesScreenProps {
  vehicles: any[];
  loadingData: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onAddVehicle: () => void;
}

export default function VehiclesScreen({
  vehicles,
  loadingData,
  onBack,
  onRefresh,
  onAddVehicle,
}: VehiclesScreenProps) {
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Mes Véhicules</Text>
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
        ) : vehicles.length === 0 ? (
          <View style={commonStyles.modernEmptyState}>
            <View style={commonStyles.emptyIconCircle}>
              <Text style={commonStyles.emptyIcon}>🚗</Text>
            </View>
            <Text style={commonStyles.emptyTitle}>Aucun véhicule</Text>
            <Text style={commonStyles.emptySubtitle}>
              Ajoutez votre premier véhicule pour commencer
            </Text>
            <TouchableOpacity style={commonStyles.modernButton} onPress={onAddVehicle}>
              <Text style={commonStyles.modernButtonText}>+ Ajouter un véhicule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((vehicle, index) => (
            <View key={index} style={commonStyles.modernCard}>
              <View style={styles.vehicleCardHeader}>
                <View style={styles.vehicleIconCircle}>
                  <Text style={styles.vehicleIcon}>🚗</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleCardTitle}>
                    {vehicle.marque} {vehicle.modele}
                  </Text>
                  <View style={styles.vehicleBadgeRow}>
                    {vehicle.annee && (
                      <View style={styles.vehicleBadge}>
                        <Text style={styles.vehicleBadgeText}>{vehicle.annee}</Text>
                      </View>
                    )}
                    {vehicle.couleur && (
                      <View style={styles.vehicleBadge}>
                        <Text style={styles.vehicleBadgeText}>{vehicle.couleur}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.vehicleCardDetails}>
                <View style={styles.vehicleDetailRow}>
                  <Text style={styles.vehicleDetailLabel}>📋 Immatriculation</Text>
                  <Text style={styles.vehicleDetailValue}>{vehicle.immatriculation}</Text>
                </View>
                {vehicle.kilometrage && (
                  <View style={styles.vehicleDetailRow}>
                    <Text style={styles.vehicleDetailLabel}>🛣️ Kilométrage</Text>
                    <Text style={styles.vehicleDetailValue}>{vehicle.kilometrage} km</Text>
                  </View>
                )}
                {vehicle.numero_chassis && (
                  <View style={styles.vehicleDetailRow}>
                    <Text style={styles.vehicleDetailLabel}>🔢 Châssis</Text>
                    <Text style={styles.vehicleDetailValue}>{vehicle.numero_chassis}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  vehicleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  vehicleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  vehicleIcon: {
    fontSize: 28,
  },
  vehicleCardTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  vehicleBadgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  vehicleBadge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  vehicleBadgeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  vehicleCardDetails: {
    gap: spacing.md,
  },
  vehicleDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleDetailLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  vehicleDetailValue: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
