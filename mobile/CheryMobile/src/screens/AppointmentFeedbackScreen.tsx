import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import api from '../config/api';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function AppointmentFeedbackScreen({ navigation, route }: any) {
  const { appointment } = route.params || {};
  const { loadUserData } = useData();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const ratingLabels: Record<number, string> = {
    1: 'Décevant 😞',
    2: 'Moyen 😐',
    3: 'Bien 🙂',
    4: 'Très bien 😊',
    5: 'Excellent ! 🌟',
  };

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Erreur', 'Veuillez sélectionner une note'); return; }
    if (!appointment) return;

    setLoading(true);
    try {
      await api.post(`/appointments/${appointment.id}/feedback`, {
        note: rating,
        commentaire: comment || undefined,
      });
      Alert.alert('Merci !', 'Votre évaluation a été soumise avec succès.', [
        { text: 'OK', onPress: () => { loadUserData(); navigation.navigate('Appointments'); } }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || error.response?.data?.error || 'Impossible de soumettre le feedback');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Évaluer le service</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        {/* Appointment Info */}
        {appointment && (
          <View style={styles.appointmentCard}>
            <Text style={styles.appointmentTitle}>📅 {appointment.agence_nom}</Text>
            <Text style={styles.appointmentDetail}>
              {new Date(appointment.date_heure).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <Text style={styles.appointmentDetail}>
              🚗 {appointment.marque_nom} {appointment.modele_nom} — {appointment.immatriculation}
            </Text>
          </View>
        )}

        {/* Rating */}
        <Text style={styles.ratingQuestion}>Comment évaluez-vous votre expérience ?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
              <Text style={[styles.starIcon, star <= rating && styles.starIconActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <View style={styles.ratingLabelContainer}>
            <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
          </View>
        )}

        {/* Comment */}
        <Text style={styles.commentLabel}>Commentaire (optionnel)</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          placeholder="Partagez votre expérience..."
          placeholderTextColor={colors.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={500}
        />
        <Text style={styles.charCount}>{comment.length}/500</Text>

        <TouchableOpacity
          style={[
            commonStyles.modernButton,
            { backgroundColor: colors.warning, marginTop: spacing.xl, marginBottom: 40 },
            (loading || rating === 0) && { opacity: 0.5 },
          ]}
          onPress={handleSubmit}
          disabled={loading || rating === 0}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.modernButtonText}>⭐ Envoyer mon évaluation</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appointmentCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginBottom: spacing.xxl,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  appointmentTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.xs },
  appointmentDetail: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 4 },
  ratingQuestion: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xl },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.lg },
  starButton: { padding: spacing.sm },
  starIcon: { fontSize: 48, color: colors.border },
  starIconActive: { color: '#FBBF24' },
  ratingLabelContainer: { alignItems: 'center', marginBottom: spacing.xl },
  ratingLabel: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  commentLabel: { fontSize: fontSize.base, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.md,
    fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary,
  },
  charCount: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'right', marginTop: 4, marginBottom: spacing.xl },
});
