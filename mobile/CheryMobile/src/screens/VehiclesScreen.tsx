import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function VehiclesScreen({ navigation }: any) {
  const { vehicles, loadingData, loadUserData, loadBookingData } = useData();

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Mes Véhicules</Text>
        <TouchableOpacity onPress={() => loadUserData()} disabled={loadingData}>
          <Text style={commonStyles.backButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        {loadingData ? (
          <View style={commonStyles.modernEmptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : vehicles.length === 0 ? (
          <View style={commonStyles.modernEmptyState}>
            <View style={commonStyles.emptyIconCircle}>
              <Text style={commonStyles.emptyIcon}>🚗</Text>
            </View>
            <Text style={commonStyles.emptyTitle}>Aucun véhicule</Text>
            <Text style={commonStyles.emptySubtitle}>Ajoutez votre premier véhicule pour commencer</Text>
            <TouchableOpacity
              style={commonStyles.modernButton}
              onPress={() => { loadBookingData(); navigation.navigate('AddVehicle'); }}>
              <Text style={commonStyles.modernButtonText}>+ Ajouter un véhicule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((vehicle: any, index: number) => (
            <View key={index} style={commonStyles.modernCard}>
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleIconCircle}>
                  <Text style={styles.vehicleIcon}>🚗</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleTitle}>
                    {vehicle.marque} {vehicle.modele}
                  </Text>
                  <View style={styles.badgeRow}>
                    {vehicle.annee && (
                      <View style={styles.badge}><Text style={styles.badgeText}>{vehicle.annee}</Text></View>
                    )}
                    {vehicle.couleur && (
                      <View style={styles.badge}><Text style={styles.badgeText}>{vehicle.couleur}</Text></View>
                    )}
                    {vehicle.statut_validation && (
                      <View style={[styles.badge, {
                        backgroundColor: vehicle.statut_validation === 'VALIDE' ? '#D1FAE5' : '#FEF3C7'
                      }]}>
                        <Text style={[styles.badgeText, {
                          color: vehicle.statut_validation === 'VALIDE' ? '#065F46' : '#92400E'
                        }]}>
                          {vehicle.statut_validation === 'VALIDE' ? '✓ Validé' : '⏳ En attente'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📋 Immatriculation</Text>
                  <Text style={styles.detailValue}>{vehicle.immatriculation}</Text>
                </View>
                {vehicle.kilometrage && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🛣️ Kilométrage</Text>
                    <Text style={styles.detailValue}>{vehicle.kilometrage} km</Text>
                  </View>
                )}
                {vehicle.numero_chassis && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🔢 Châssis</Text>
                    <Text style={styles.detailValue}>{vehicle.numero_chassis}</Text>
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
  vehicleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  vehicleIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.purple, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  vehicleIcon: { fontSize: 28 },
  vehicleTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  badge: { backgroundColor: colors.borderLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.md },
  badgeText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  detailsContainer: { gap: spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: fontSize.base, color: colors.textSecondary },
  detailValue: { fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary },
});
