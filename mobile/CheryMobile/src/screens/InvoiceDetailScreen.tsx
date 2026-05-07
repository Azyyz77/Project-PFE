import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import api from '../config/api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';

interface InvoiceDetail {
  id: number;
  numero: string;
  statut_paiement: 'EMISE' | 'ENVOYEE' | 'PAYEE' | 'ANNULEE';
  date_emission: string;
  date_echeance?: string;
  date_paiement?: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  taux_tva: number;
  mode_paiement?: string;
  commande_numero?: string;
  client_nom?: string;
  client_prenom?: string;
  vehicule_immatriculation?: string;
  vehicule_marque?: string;
  vehicule_modele?: string;
  agence_nom?: string;
  lignes?: Array<{
    id: number;
    description: string;
    quantite: number;
    prix_unitaire: number;
    montant_total: number;
  }>;
}

const STATUS_CONFIG = {
  EMISE: { label: 'Émise', color: '#1976D2', bg: '#E3F2FD', icon: '📄' },
  ENVOYEE: { label: 'Envoyée', color: '#F57C00', bg: '#FFF3E0', icon: '📧' },
  PAYEE: { label: 'Payée', color: '#388E3C', bg: '#E8F5E9', icon: '✅' },
  ANNULEE: { label: 'Annulée', color: '#D32F2F', bg: '#FFEBEE', icon: '❌' },
};

export default function InvoiceDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { invoiceId } = route.params as { invoiceId: number };

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadInvoiceDetail();
  }, [invoiceId]);

  const loadInvoiceDetail = async () => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      setInvoice(response.data.invoice || response.data.facture || response.data);
    } catch (error: any) {
      console.error('Failed to load invoice detail:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les détails de la facture',
        [{ text: 'Retour', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoiceDetail();
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

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      
      // Récupérer le token d'authentification
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour télécharger le PDF');
        return;
      }
      
      // Construire l'URL du PDF
      const pdfUrl = `${api.defaults.baseURL}/invoices/${invoiceId}/pdf`;
      
      // Nom et chemin du fichier - utiliser documentDirectory qui est accessible
      const fileName = `Facture_${invoice?.numero || invoiceId}.pdf`;
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
      setDownloading(false);
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

  if (!invoice) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>Facture introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[invoice.statut_paiement];

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
            <Text style={styles.invoiceNumber}>{invoice.numero}</Text>
            <Text style={styles.invoiceDate}>{formatDate(invoice.date_emission)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Informations Client */}
      {(invoice.client_nom || invoice.client_prenom) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Client</Text>
          <View style={styles.card}>
            <InfoRow 
              label="Nom" 
              value={`${invoice.client_prenom || ''} ${invoice.client_nom || ''}`.trim()} 
            />
          </View>
        </View>
      )}

      {/* Informations Véhicule */}
      {invoice.vehicule_immatriculation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Véhicule</Text>
          <View style={styles.card}>
            <InfoRow label="Immatriculation" value={invoice.vehicule_immatriculation} />
            {invoice.vehicule_marque && invoice.vehicule_modele && (
              <InfoRow label="Modèle" value={`${invoice.vehicule_marque} ${invoice.vehicule_modele}`} />
            )}
          </View>
        </View>
      )}

      {/* Informations Commande */}
      {invoice.commande_numero && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Commande</Text>
          <View style={styles.card}>
            <InfoRow label="Numéro" value={invoice.commande_numero} />
          </View>
        </View>
      )}

      {/* Lignes de Facture */}
      {invoice.lignes && invoice.lignes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Détails</Text>
          {invoice.lignes.map((line, index) => (
            <View key={line.id} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineNumber}>#{index + 1}</Text>
              </View>

              <Text style={styles.lineDescription}>{line.description}</Text>

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
          ))}
        </View>
      )}

      {/* Montants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Montants</Text>
        <View style={styles.card}>
          <InfoRow label="Montant HT" value={`${formatAmount(invoice.montant_ht)} TND`} />
          <InfoRow
            label={`TVA (${invoice.taux_tva}%)`}
            value={`${formatAmount(invoice.montant_tva)} TND`}
          />
          <View style={styles.divider} />
          <InfoRow
            label="Total TTC"
            value={`${formatAmount(invoice.montant_ttc)} TND`}
            bold
          />
        </View>
      </View>

      {/* Informations de Paiement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Paiement</Text>
        <View style={styles.card}>
          <InfoRow label="Statut" value={statusConfig.label} />
          {invoice.date_echeance && (
            <InfoRow label="Date d'échéance" value={formatDate(invoice.date_echeance)} />
          )}
          {invoice.date_paiement && (
            <InfoRow label="Date de paiement" value={formatDate(invoice.date_paiement)} />
          )}
          {invoice.mode_paiement && (
            <InfoRow label="Mode de paiement" value={invoice.mode_paiement} />
          )}
        </View>
      </View>

      {/* Agence */}
      {invoice.agence_nom && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Agence</Text>
          <View style={styles.card}>
            <InfoRow label="Nom" value={invoice.agence_nom} />
          </View>
        </View>
      )}

      {/* Bouton Télécharger PDF */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
          onPress={handleDownloadPDF}
          disabled={downloading}>
          {downloading ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <>
              <Text style={styles.downloadButtonIcon}>📥</Text>
              <Text style={styles.downloadButtonText}>Télécharger le PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
  invoiceNumber: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  invoiceDate: {
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    ...shadows.md,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonIcon: {
    fontSize: 24,
  },
  downloadButtonText: {
    fontSize: fontSize.base,
    color: colors.textWhite,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
