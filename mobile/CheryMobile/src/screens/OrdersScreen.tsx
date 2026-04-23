import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function OrdersScreen({ navigation }: any) {
  const { orders, loadingData, loadUserData } = useData();

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    EN_ATTENTE:  { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
    EN_COURS:    { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours' },
    TERMINE:     { bg: '#D1FAE5', text: '#065F46', label: 'Terminée' },
    ANNULE:      { bg: '#FEE2E2', text: '#991B1B', label: 'Annulée' },
    LIVRE:       { bg: '#D1FAE5', text: '#065F46', label: 'Livrée' },
  };

  return (
    <View style={styles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Mes Commandes</Text>
        <TouchableOpacity onPress={() => loadUserData()} disabled={loadingData}>
          <Text style={commonStyles.backButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        {loadingData ? (
          <View style={commonStyles.modernEmptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={commonStyles.modernEmptyState}>
            <View style={commonStyles.emptyIconCircle}><Text style={commonStyles.emptyIcon}>🔧</Text></View>
            <Text style={commonStyles.emptyTitle}>Aucune commande</Text>
            <Text style={commonStyles.emptySubtitle}>Vos commandes de pièces de rechange apparaîtront ici.</Text>
          </View>
        ) : (
          orders.map((order: any, i: number) => {
            const status = statusConfig[order.statut] || { bg: '#F1F5F9', text: '#475569', label: order.statut };
            const orderDate = order.date_heure ? new Date(order.date_heure) : null;
            return (
              <View key={i} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderNumber}>Commande #{order.id}</Text>
                    {orderDate && (
                      <Text style={styles.orderDate}>
                        📅 {orderDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>🚗</Text>
                  <Text style={styles.detailText}>{order.marque_nom} {order.modele_nom}</Text>
                </View>
                {order.immatriculation && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📋</Text>
                    <Text style={styles.detailText}>{order.immatriculation}</Text>
                  </View>
                )}
                {order.agence_nom && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🏢</Text>
                    <Text style={styles.detailText}>{order.agence_nom}</Text>
                  </View>
                )}
                {order.cout_total != null && (
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{Number(order.cout_total).toFixed(2)} TND</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  orderNumber: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.textPrimary },
  orderDate: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full },
  statusText: { fontSize: fontSize.xs, fontWeight: '700' },
  separator: { height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  detailIcon: { fontSize: fontSize.md, marginRight: spacing.sm, width: 24 },
  detailText: { fontSize: fontSize.base, color: colors.textSecondary },
  totalRow: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight, justifyContent: 'space-between' },
  totalLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.primary },
});
