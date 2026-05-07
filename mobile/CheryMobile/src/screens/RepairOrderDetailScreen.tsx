import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../config/api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';

interface RepairOrderLine {
  id: number;
  type_ligne: 'INTERVENTION' | 'PIECE';
  description: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  intervention_nom?: string;
  piece_reference?: string;
}

interface RepairOrderDetail {
  id: number;
  numero: string;
  statut: 'BROUILLON' | 'EN_COURS' | 'TERMINEE' | 'FACTUREE';
  date_creation: string;
  date_modification?: string;
  montant_total_ht: number;
  montant_tva: number;
  montant_total_ttc: number;
  taux_tva: number;
  vehicule_immatriculation?: string;
  vehicule_marque?: string;
  vehicule_modele?: string;
  agence_nom?: string;
  agent_nom?: string;
  facture_numero?: string;
  lignes: RepairOrderLine[];
}

const STATUS_CONFIG = {
  BROUILLON: { label: 'Brouillon', color: colors.textMuted, bg: '#E0E0E0', icon: '📝' },
  EN_COURS: { label: 'En cours', color: '#1976D2', bg: '#E3F2FD', icon: '⚙️' },
  TERMINEE: { label: 'Terminée', color: '#388E3C', bg: '#E8F5E9', icon: '✅' },
  FACTUREE: { label: 'Facturée', color: '#7B1FA2', bg: '#F3E5F5', icon: '💰' },
};

export default function RepairOrderDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as { orderId: number };

  const [order, setOrder] = useState<RepairOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const response = await api.get(`/repair-orders/${orderId}`);
      setOrder(response.data.order || response.data);
    } catch (error: any) {
      console.error('Failed to load order detail:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les détails de la commande',
        [{ text: 'Retour', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrderDetail();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewInvoice = () => {
    if (order?.facture_numero) {
      // Navigation vers l'écran de facture (à implémenter)
      Alert.alert('Info', `Facture: ${order.facture_numero}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>Commande introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[order.statut];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.orderNumber}>{order.numero}</Text>
            <Text style={styles.orderDate}>{formatDate(order.date_creation)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Informations Véhicule */}
      {order.vehicule_immatriculation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Véhicule</Text>
          <View style={styles.card}>
            <InfoRow label="Immatriculation" value={order.vehicule_immatriculation} />
            {order.vehicule_marque && order.vehicule_modele && (
              <InfoRow label="Modèle" value={`${order.vehicule_marque} ${order.vehicule_modele}`} />
            )}
          </View>
        </View>
      )}

      {/* Informations Agence/Agent */}
      {(order.agence_nom || order.agent_nom) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Service</Text>
          <View style={styles.card}>
            {order.agence_nom && <InfoRow label="Agence" value={order.agence_nom} />}
            {order.agent_nom && <InfoRow label="Agent" value={order.agent_nom} />}
          </View>
        </View>
      )}

      {/* Lignes de Commande */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Détails de la commande</Text>
        {order.lignes && order.lignes.length > 0 ? (
          order.lignes.map((line, index) => (
            <View key={line.id} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <View style={styles.lineTypeContainer}>
                  <Text style={styles.lineType}>
                    {line.type_ligne === 'INTERVENTION' ? '🔧' : '🔩'}
                  </Text>
                  <Text style={styles.lineTypeText}>
                    {line.type_ligne === 'INTERVENTION' ? 'Intervention' : 'Pièce'}
                  </Text>
                </View>
                <Text style={styles.lineNumber}>#{index + 1}</Text>
              </View>

              <Text style={styles.lineDescription}>{line.description}</Text>

              {line.intervention_nom && (
                <Text style={styles.lineSubInfo}>Intervention: {line.intervention_nom}</Text>
              )}
              {line.piece_reference && (
                <Text style={styles.lineSubInfo}>Référence: {line.piece_reference}</Text>
              )}

              <View style={styles.lineDetails}>
                <View style={styles.lineDetailRow}>
                  <Text style={styles.lineDetailLabel}>Quantité</Text>
                  <Text style={styles.lineDetailValue}>{line.quantite}</Text>
                </View>
                <View style={styles.lineDetailRow}>
                  <Text style={styles.lineDetailLabel}>Prix unitaire</Text>
                  <Text style={styles.lineDetailValue}>{formatAmount(line.prix_unitaire)} TND</Text>
                </View>
                <View style={styles.lineDetailRow}>
                  <Text style={styles.lineDetailLabel}>Total</Text>
                  <Text style={styles.lineDetailValueBold}>
                    {formatAmount(line.montant_total)} TND
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyLines}>
            <Text style={styles.emptyLinesText}>Aucune ligne de commande</Text>
          </View>
        )}
      </View>

      {/* Totaux */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Montants</Text>
        <View style={styles.card}>
          <InfoRow label="Montant HT" value={`${formatAmount(order.montant_total_ht)} TND`} />
          <InfoRow
            label={`TVA (${order.taux_tva}%)`}
            value={`${formatAmount(order.montant_tva)} TND`}
          />
          <View style={styles.divider} />
          <InfoRow
            label="Total TTC"
            value={`${formatAmount(order.montant_total_ttc)} TND`}
            bold
          />
        </View>
      </View>

      {/* Bouton Facture */}
      {order.statut === 'FACTUREE' && order.facture_numero && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.invoiceButton} onPress={handleViewInvoice}>
            <Text style={styles.invoiceButtonIcon}>📄</Text>
            <View style={styles.invoiceButtonContent}>
              <Text style={styles.invoiceButtonText}>Voir la facture</Text>
              <Text style={styles.invoiceButtonSubtext}>{order.facture_numero}</Text>
            </View>
            <Text style={styles.invoiceButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Historique */}
      {order.date_modification && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Historique</Text>
          <View style={styles.card}>
            <InfoRow label="Créée le" value={formatDate(order.date_creation)} />
            <InfoRow label="Modifiée le" value={formatDate(order.date_modification)} />
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const InfoRow = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, bold && styles.infoValueBold]}>{value}</Text>
  </View>
);

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusIcon: {
    fontSize: fontSize.base,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  infoValueBold: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  lineCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lineTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lineType: {
    fontSize: fontSize.lg,
  },
  lineTypeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  lineNumber: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  lineDescription: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  lineSubInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  lineDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lineDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lineDetailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  lineDetailValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  lineDetailValueBold: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyLines: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyLinesText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  invoiceButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  invoiceButtonIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  invoiceButtonContent: {
    flex: 1,
  },
  invoiceButtonText: {
    fontSize: fontSize.base,
    color: colors.textWhite,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  invoiceButtonSubtext: {
    fontSize: fontSize.sm,
    color: colors.textWhite,
    opacity: 0.8,
  },
  invoiceButtonArrow: {
    fontSize: fontSize.xl,
    color: colors.textWhite,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
