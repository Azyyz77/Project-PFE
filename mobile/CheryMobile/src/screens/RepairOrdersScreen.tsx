import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../config/api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';

interface RepairOrder {
  id: number;
  numero: string;
  statut: 'BROUILLON' | 'EN_COURS' | 'TERMINEE' | 'FACTUREE';
  montant_total_ttc: number;
  date_creation: string;
  vehicule_immatriculation?: string;
  agence_nom?: string;
}

const STATUS_CONFIG = {
  BROUILLON: { label: 'Brouillon', color: colors.textMuted, bg: '#E0E0E0' },
  EN_COURS: { label: 'En cours', color: '#1976D2', bg: '#E3F2FD' },
  TERMINEE: { label: 'Terminée', color: '#388E3C', bg: '#E8F5E9' },
  FACTUREE: { label: 'Facturée', color: '#7B1FA2', bg: '#F3E5F5' },
};

export default function RepairOrdersScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [selectedFilter, orders]);

  const loadOrders = async () => {
    try {
      const response = await api.get('/repair-orders/my');
      const data = response.data.orders || response.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load repair orders:', error);
      if (error.response?.status !== 401) {
        Alert.alert('Erreur', 'Impossible de charger les commandes de réparation');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const filterOrders = () => {
    if (selectedFilter === 'ALL') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.statut === selectedFilter));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderFilterButton = (filter: string, label: string) => {
    const isSelected = selectedFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterButton, isSelected && styles.filterButtonActive]}
        onPress={() => setSelectedFilter(filter)}>
        <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderOrderCard = ({ item }: { item: RepairOrder }) => {
    const statusConfig = STATUS_CONFIG[item.statut];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RepairOrderDetail' as never, { orderId: item.id } as never)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.orderNumber}>{item.numero}</Text>
            {item.vehicule_immatriculation && (
              <Text style={styles.vehicleInfo}>🚗 {item.vehicule_immatriculation}</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Montant TTC</Text>
            <Text style={styles.amount}>{formatAmount(item.montant_total_ttc)} TND</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date de création</Text>
            <Text style={styles.infoValue}>{formatDate(item.date_creation)}</Text>
          </View>

          {item.agence_nom && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Agence</Text>
              <Text style={styles.infoValue}>{item.agence_nom}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.detailsLink}>Voir les détails →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>Aucune commande</Text>
      <Text style={styles.emptyStateText}>
        {selectedFilter === 'ALL'
          ? 'Vous n\'avez pas encore de commandes de réparation'
          : `Aucune commande avec le statut "${STATUS_CONFIG[selectedFilter as keyof typeof STATUS_CONFIG]?.label}"`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des commandes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Commandes</Text>
        <Text style={styles.subtitle}>
          {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        {renderFilterButton('ALL', 'Toutes')}
        {renderFilterButton('BROUILLON', 'Brouillon')}
        {renderFilterButton('EN_COURS', 'En cours')}
        {renderFilterButton('TERMINEE', 'Terminées')}
        {renderFilterButton('FACTUREE', 'Facturées')}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.textWhite,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  vehicleInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  cardBody: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  amount: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: 'bold',
  },
  cardFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  detailsLink: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
