import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import api from '../config/api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';

interface Invoice {
  id: number;
  numero: string;
  statut_paiement: 'EMISE' | 'ENVOYEE' | 'PAYEE' | 'ANNULEE';
  montant_ttc: number;
  date_emission: string;
  date_echeance?: string;
  commande_numero?: string;
}

const STATUS_CONFIG = {
  EMISE: { label: 'Émise', color: '#1976D2', bg: '#E3F2FD', icon: '📄' },
  ENVOYEE: { label: 'Envoyée', color: '#F57C00', bg: '#FFF3E0', icon: '📧' },
  PAYEE: { label: 'Payée', color: '#388E3C', bg: '#E8F5E9', icon: '✅' },
  ANNULEE: { label: 'Annulée', color: '#D32F2F', bg: '#FFEBEE', icon: '❌' },
};

export default function InvoicesScreen() {
  const navigation = useNavigation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [selectedFilter, invoices]);

  const loadInvoices = async () => {
    try {
      const response = await api.get('/invoices/my');
      const data = response.data.invoices || response.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load invoices:', error);
      if (error.response?.status !== 401) {
        Alert.alert('Erreur', 'Impossible de charger les factures');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const filterInvoices = () => {
    if (selectedFilter === 'ALL') {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(invoice => invoice.statut_paiement === selectedFilter));
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

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      setDownloadingId(invoiceId);
      
      // Récupérer le token d'authentification
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour télécharger le PDF');
        return;
      }
      
      // Construire l'URL du PDF
      const pdfUrl = `${api.defaults.baseURL}/invoices/${invoiceId}/pdf`;
      
      // Nom et chemin du fichier - utiliser documentDirectory qui est accessible
      const fileName = `Facture_${invoiceId}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      console.log('Downloading PDF from:', pdfUrl);
      console.log('Saving to:', fileUri);
      
      // Télécharger le fichier avec l'API legacy
      const downloadResult = await FileSystem.downloadAsync(
        pdfUrl,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Download result:', downloadResult);
      
      if (downloadResult.status === 200) {
        // Vérifier si le partage est disponible
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          // Partager le fichier (ouvre le menu de partage natif)
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Ouvrir la facture',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Succès',
            `Le PDF a été téléchargé dans ${fileUri}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Erreur', `Impossible de télécharger le PDF (Status: ${downloadResult.status})`);
      }
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le PDF: ' + error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewDetails = (invoiceId: number) => {
    (navigation as any).navigate('InvoiceDetail', { invoiceId });
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

  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    const statusConfig = STATUS_CONFIG[item.statut_paiement];
    const isDownloading = downloadingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.invoiceNumber}>{item.numero}</Text>
            {item.commande_numero && (
              <Text style={styles.orderInfo}>Commande: {item.commande_numero}</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
            <Text style={styles.badgeIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Montant TTC</Text>
            <Text style={styles.amount}>{formatAmount(item.montant_ttc)} TND</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date d'émission</Text>
            <Text style={styles.infoValue}>{formatDate(item.date_emission)}</Text>
          </View>

          {item.date_echeance && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date d'échéance</Text>
              <Text style={styles.infoValue}>{formatDate(item.date_echeance)}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, isDownloading && styles.buttonDisabled]}
            onPress={() => handleDownloadPDF(item.id)}
            disabled={isDownloading}>
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Text style={styles.buttonIcon}>📥</Text>
                <Text style={styles.buttonTextSecondary}>PDF</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => handleViewDetails(item.id)}>
            <Text style={styles.buttonTextPrimary}>Voir détails</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💰</Text>
      <Text style={styles.emptyStateTitle}>Aucune facture</Text>
      <Text style={styles.emptyStateText}>
        {selectedFilter === 'ALL'
          ? 'Vous n\'avez pas encore de factures'
          : `Aucune facture avec le statut "${STATUS_CONFIG[selectedFilter as keyof typeof STATUS_CONFIG]?.label}"`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des factures...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Factures</Text>
        <Text style={styles.subtitle}>
          {filteredInvoices.length} facture{filteredInvoices.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        {renderFilterButton('ALL', 'Toutes')}
        {renderFilterButton('EMISE', 'Émises')}
        {renderFilterButton('ENVOYEE', 'Envoyées')}
        {renderFilterButton('PAYEE', 'Payées')}
        {renderFilterButton('ANNULEE', 'Annulées')}
      </View>

      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceCard}
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
  invoiceNumber: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  orderInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  badgeIcon: {
    fontSize: fontSize.sm,
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
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: fontSize.base,
  },
  buttonTextPrimary: {
    fontSize: fontSize.base,
    color: colors.textWhite,
    fontWeight: '600',
  },
  buttonTextSecondary: {
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
