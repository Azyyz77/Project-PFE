import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import api from '../config/api';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function ComplaintsScreen({ navigation }: any) {
  const { complaints, loadingData, loadUserData } = useData();

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!subject || !description) { Alert.alert('Erreur', 'Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      await api.post('/complaints', { sujet: subject, description });
      Alert.alert('Succès', 'Réclamation créée avec succès');
      setShowForm(false); setSubject(''); setDescription('');
      await loadUserData();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer la réclamation');
    } finally { setLoading(false); }
  };

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    EN_ATTENTE: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
    EN_COURS:   { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours' },
    TRAITEE:    { bg: '#D1FAE5', text: '#065F46', label: 'Traitée' },
    CLOTUREE:   { bg: '#F1F5F9', text: '#475569', label: 'Clôturée' },
  };

  return (
    <View style={styles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Réclamations</Text>
        <TouchableOpacity onPress={() => loadUserData()} disabled={loadingData}>
          <Text style={commonStyles.backButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        {/* New complaint form toggle */}
        <TouchableOpacity
          style={[commonStyles.modernButton, { backgroundColor: colors.warning, marginBottom: spacing.xl }]}
          onPress={() => setShowForm(!showForm)}>
          <Text style={commonStyles.modernButtonText}>
            {showForm ? '✕ Annuler' : '+ Nouvelle réclamation'}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>📝 Nouvelle réclamation</Text>
            <Text style={styles.inputLabel}>Sujet *</Text>
            <TextInput
              style={styles.input}
              placeholder="Sujet de la réclamation"
              placeholderTextColor={colors.textMuted}
              value={subject} onChangeText={setSubject} />
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Décrivez votre réclamation..."
              placeholderTextColor={colors.textMuted}
              value={description} onChangeText={setDescription} multiline />
            <TouchableOpacity
              style={[commonStyles.modernButton, loading && { opacity: 0.6 }]}
              onPress={handleCreate} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.modernButtonText}>Envoyer la réclamation</Text>}
            </TouchableOpacity>
          </View>
        )}

        {loadingData ? (
          <View style={commonStyles.modernEmptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : complaints.length === 0 ? (
          <View style={commonStyles.modernEmptyState}>
            <View style={commonStyles.emptyIconCircle}><Text style={commonStyles.emptyIcon}>📝</Text></View>
            <Text style={commonStyles.emptyTitle}>Aucune réclamation</Text>
            <Text style={commonStyles.emptySubtitle}>Vous n'avez pas encore soumis de réclamation.</Text>
          </View>
        ) : (
          complaints.map((c: any, i: number) => {
            const status = statusConfig[c.statut] || statusConfig.EN_ATTENTE;
            return (
              <View key={i} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{c.sujet}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardDescription}>{c.description}</Text>
                <Text style={styles.cardDate}>
                  📅 {new Date(c.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
                {c.reponse && (
                  <View style={styles.responseBox}>
                    <Text style={styles.responseLabel}>💬 Réponse de l'agent :</Text>
                    <Text style={styles.responseText}>{c.reponse}</Text>
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
  formCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.background, padding: spacing.md, borderRadius: borderRadius.sm, fontSize: fontSize.base, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardTitle: { flex: 1, fontSize: fontSize.md, fontWeight: 'bold', color: colors.textPrimary, marginRight: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full },
  statusText: { fontSize: fontSize.xs, fontWeight: '600' },
  cardDescription: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 20 },
  cardDate: { fontSize: fontSize.sm, color: colors.textMuted },
  responseBox: { marginTop: spacing.md, backgroundColor: '#EFF6FF', borderRadius: borderRadius.sm, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary },
  responseLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  responseText: { fontSize: fontSize.base, color: colors.textPrimary, lineHeight: 20 },
});
