import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Modal,
} from 'react-native';
import api from '../config/api';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function BookAppointmentScreen({ navigation }: any) {
  const { vehicles, agencies, interventions, loadingBooking, loadBookingData, loadUserData } = useData();

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [selectedInterventionId, setSelectedInterventionId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => { loadBookingData(); }, []);

  const validVehicles = vehicles.filter((v: any) => v.statut_validation === 'VALIDE');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: any[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dt = new Date(year, month, d);
      days.push({ dateStr: dt.toISOString().split('T')[0], day: d });
    }
    return days;
  };

  const isDateInPast = (dateStr: string) => {
    const d = new Date(dateStr), today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const loadSlots = async (agencyId: string, date: string) => {
    setLoadingSlots(true);
    try {
      const res = await api.get('/appointments/slots', { params: { agenceId: agencyId, date } });
      const slots = res.data.slots || res.data;
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch { setAvailableSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr); setSelectedTime(''); setShowCalendar(false);
    if (selectedAgencyId) loadSlots(selectedAgencyId, dateStr);
  };

  const handleBook = async () => {
    if (!selectedVehicleId || !selectedAgencyId || !selectedDate || !selectedTime || !selectedInterventionId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires'); return;
    }
    setLoading(true);
    try {
      await api.post('/appointments', {
        vehicule_id: Number(selectedVehicleId), agence_id: Number(selectedAgencyId),
        date_heure: `${selectedDate}T${selectedTime}:00`,
        description: notes || undefined, sous_type_ids: [Number(selectedInterventionId)],
      });
      Alert.alert('Succès', 'Rendez-vous réservé avec succès !');
      await loadUserData();
      navigation.navigate('Appointments');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de réserver');
    } finally { setLoading(false); }
  };

  if (loadingBooking) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Réserver un RDV</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        {validVehicles.length === 0 ? (
          <View style={commonStyles.modernEmptyState}>
            <View style={commonStyles.emptyIconCircle}><Text style={commonStyles.emptyIcon}>⚠️</Text></View>
            <Text style={commonStyles.emptyTitle}>Aucun véhicule validé</Text>
            <Text style={commonStyles.emptySubtitle}>Ajoutez un véhicule et attendez la validation pour réserver.</Text>
            <TouchableOpacity style={commonStyles.modernButton} onPress={() => navigation.navigate('AddVehicle')}>
              <Text style={commonStyles.modernButtonText}>Ajouter un véhicule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Véhicule *</Text>
            {validVehicles.map((v: any) => (
              <TouchableOpacity key={v.id}
                style={[styles.option, selectedVehicleId === String(v.id) && styles.optionSelected]}
                onPress={() => setSelectedVehicleId(String(v.id))}>
                <Text style={[styles.optionText, selectedVehicleId === String(v.id) && styles.optionTextSelected]}>
                  🚗 {v.marque} {v.modele} — {v.immatriculation}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>Agence *</Text>
            {agencies.map((a: any) => (
              <TouchableOpacity key={a.id}
                style={[styles.option, selectedAgencyId === String(a.id) && styles.optionSelected]}
                onPress={() => { setSelectedAgencyId(String(a.id)); if (selectedDate) loadSlots(String(a.id), selectedDate); }}>
                <Text style={[styles.optionText, selectedAgencyId === String(a.id) && styles.optionTextSelected]}>
                  🏢 {a.nom} — {a.ville}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>Type d'intervention *</Text>
            {interventions.map((type: any) =>
              type.sous_types?.map((sub: any) => (
                <TouchableOpacity key={sub.id}
                  style={[styles.option, selectedInterventionId === String(sub.id) && styles.optionSelected]}
                  onPress={() => setSelectedInterventionId(String(sub.id))}>
                  <Text style={[styles.optionText, selectedInterventionId === String(sub.id) && styles.optionTextSelected]}>
                    🔧 {type.nom} — {sub.nom}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            <Text style={styles.sectionLabel}>Date *</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowCalendar(true)}>
              <Text style={{ color: selectedDate ? colors.textPrimary : colors.textMuted, fontSize: fontSize.md }}>
                {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '📅 Sélectionner une date'}
              </Text>
            </TouchableOpacity>

            <Modal visible={showCalendar} transparent animationType="slide" onRequestClose={() => setShowCalendar(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.calendarModal}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                      <Text style={styles.calendarNav}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.calendarTitle}>
                      {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                      <Text style={styles.calendarNav}>›</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.weekdays}>
                    {['D','L','M','M','J','V','S'].map((d, i) => <Text key={i} style={styles.weekdayText}>{d}</Text>)}
                  </View>
                  <View style={styles.daysGrid}>
                    {getDaysInMonth(currentMonth).map((item, i) => {
                      if (!item) return <View key={`e-${i}`} style={styles.dayCell} />;
                      const isPast = isDateInPast(item.dateStr);
                      const isSelected = selectedDate === item.dateStr;
                      const isToday = item.dateStr === new Date().toISOString().split('T')[0];
                      return (
                        <TouchableOpacity key={item.dateStr}
                          style={[styles.dayCell, isSelected && styles.dayCellSelected, isToday && !isSelected && styles.dayCellToday, isPast && styles.dayCellDisabled]}
                          onPress={() => !isPast && handleDateSelect(item.dateStr)} disabled={isPast}>
                          <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isPast && styles.dayTextDisabled]}>
                            {item.day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity style={styles.calendarClose} onPress={() => setShowCalendar(false)}>
                    <Text style={styles.calendarCloseText}>Fermer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {selectedDate && selectedAgencyId && (
              <>
                <Text style={styles.sectionLabel}>Heure *</Text>
                {loadingSlots ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.xl }} />
                ) : availableSlots.length === 0 ? (
                  <View style={styles.noSlots}><Text style={styles.noSlotsText}>Aucun créneau disponible pour cette date</Text></View>
                ) : (
                  <View style={styles.slotsGrid}>
                    {availableSlots.map((slot: any, i: number) => (
                      <TouchableOpacity key={i}
                        style={[styles.slotBtn, slot.is_full && styles.slotBtnDisabled, selectedTime === slot.label && styles.slotBtnSelected]}
                        onPress={() => !slot.is_full && setSelectedTime(slot.label)} disabled={slot.is_full}>
                        <Text style={[styles.slotText, selectedTime === slot.label && styles.slotTextSelected]}>{slot.label}</Text>
                        {slot.is_full && <Text style={styles.slotFullText}>Complet</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            <Text style={styles.sectionLabel}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Informations supplémentaires..." placeholderTextColor={colors.textMuted}
              value={notes} onChangeText={setNotes} multiline />

            <TouchableOpacity
              style={[commonStyles.modernButton, loading && { opacity: 0.6 }, { marginTop: spacing.xl, marginBottom: 40 }]}
              onPress={handleBook} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.modernButtonText}>Confirmer la réservation</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  sectionLabel: { fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.xl },
  option: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.xs },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  optionText: { color: colors.textSecondary, fontSize: fontSize.base },
  optionTextSelected: { color: colors.primary, fontWeight: '600' },
  dateInput: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border },
  input: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.md, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  calendarModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, paddingBottom: 40 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  calendarNav: { fontSize: 28, color: colors.primary, paddingHorizontal: spacing.md },
  calendarTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.textPrimary },
  weekdays: { flexDirection: 'row', marginBottom: spacing.sm },
  weekdayText: { flex: 1, textAlign: 'center', fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 100 },
  dayCellSelected: { backgroundColor: colors.primary },
  dayCellToday: { backgroundColor: colors.borderLight },
  dayCellDisabled: { opacity: 0.3 },
  dayText: { fontSize: fontSize.base, color: colors.textPrimary },
  dayTextSelected: { color: '#fff', fontWeight: 'bold' },
  dayTextDisabled: { color: colors.textMuted },
  calendarClose: { marginTop: spacing.xl, alignItems: 'center', padding: spacing.md },
  calendarCloseText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600' },
  noSlots: { backgroundColor: '#FEF3C7', padding: spacing.lg, borderRadius: borderRadius.md },
  noSlotsText: { color: '#92400E', textAlign: 'center', fontSize: fontSize.base },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slotBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', minWidth: 80 },
  slotBtnSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotBtnDisabled: { opacity: 0.4, backgroundColor: colors.borderLight },
  slotText: { fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' },
  slotTextSelected: { color: '#fff', fontWeight: 'bold' },
  slotFullText: { fontSize: fontSize.xs, color: colors.error, marginTop: 2 },
});
