import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import api from '../config/api';
import { FacebookButton, FacebookCard, FacebookInput } from '../components/facebook';

export default function BookAppointmentStep2Screen({ navigation, route }: any) {
  const { selectedVehicleId, selectedAgencyId, selectedInterventionId, selectedPackageIds } = route.params;
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');

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

  const loadSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      const res = await api.get('/appointments/slots', { 
        params: { agenceId: selectedAgencyId, date } 
      });
      const slots = res.data.slots || res.data;
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch { 
      setAvailableSlots([]); 
    } finally { 
      setLoadingSlots(false); 
    }
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
    setShowCalendar(false);
    loadSlots(dateStr);
  };

  useEffect(() => {
    if (route.params?.selectedDate) {
      setSelectedDate(route.params.selectedDate);
      loadSlots(route.params.selectedDate);
    }
    if (route.params?.selectedTime) {
      setSelectedTime(route.params.selectedTime);
    }
    if (route.params?.notes) {
      setNotes(route.params.notes);
    }
  }, [route.params]);

  const handleNext = () => {
    navigation.navigate('BookAppointmentStep3', {
      selectedVehicleId,
      selectedAgencyId,
      selectedInterventionId,
      selectedPackageIds,
      selectedDate,
      selectedTime,
      notes,
    });
  };

  const handleBack = () => {
    navigation.navigate('BookAppointmentStep1', {
      selectedVehicleId,
      selectedAgencyId,
      selectedInterventionId,
      selectedPackageIds,
    });
  };

  const canProceed = selectedDate && selectedTime;

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.modalTitle}>Réserver un rendez-vous</Text>
            <Text style={styles.modalSubtitle}>Étape 2 sur 3</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={styles.progressBar} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Selection */}
          <Text style={styles.sectionLabel}>Date *</Text>
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.dateInputIcon}>📅</Text>
            <Text style={[
              styles.dateInputText,
              !selectedDate && styles.dateInputPlaceholder
            ]}>
              {selectedDate 
                ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { 
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                : 'jj/mm/aaaa'
              }
            </Text>
            <Text style={styles.calendarIcon}>📆</Text>
          </TouchableOpacity>

          {/* Time Slots */}
          <Text style={styles.sectionLabel}>Créneau horaire *</Text>
          {!selectedDate ? (
            <FacebookCard style={styles.noSlotsCard}>
              <Text style={styles.clockIcon}>🕐</Text>
              <Text style={styles.noSlotsTitle}>Aucun créneau disponible</Text>
              <Text style={styles.noSlotsText}>
                Veuillez sélectionner une autre date
              </Text>
            </FacebookCard>
          ) : loadingSlots ? (
            <FacebookCard style={styles.loadingSlotsCard}>
              <Text style={styles.loadingSlotsText}>Chargement des créneaux...</Text>
            </FacebookCard>
          ) : availableSlots.length === 0 ? (
            <FacebookCard style={styles.noSlotsCard}>
              <Text style={styles.clockIcon}>🕐</Text>
              <Text style={styles.noSlotsTitle}>Aucun créneau disponible</Text>
              <Text style={styles.noSlotsText}>
                Veuillez sélectionner une autre date
              </Text>
            </FacebookCard>
          ) : (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot: any, i: number) => {
                const isSelected = selectedTime === slot.label;
                const isFull = slot.is_full;
                const availability = slot.capacity - slot.reserved;
                
                return (
                  <TouchableOpacity 
                    key={i}
                    style={[
                      styles.slotBtn, 
                      isFull && styles.slotBtnDisabled, 
                      isSelected && styles.slotBtnSelected
                    ]}
                    onPress={() => !isFull && setSelectedTime(slot.label)} 
                    disabled={isFull}
                  >
                    <Text style={[
                      styles.slotText, 
                      isSelected && styles.slotTextSelected,
                      isFull && styles.slotTextDisabled
                    ]}>
                      {slot.label}
                    </Text>
                    {!isFull && !isSelected && (
                      <Text style={styles.slotAvailability}>
                        {availability} {availability > 1 ? 'places' : 'place'}
                      </Text>
                    )}
                    {isFull && (
                      <Text style={styles.slotFullText}>Complet</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Notes */}
          <Text style={styles.sectionLabel}>Notes additionnelles</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Indiquez ici toute information utile..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Calendar Modal */}
        <Modal 
          visible={showCalendar} 
          transparent 
          animationType="slide" 
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.calendarOverlay}>
            <FacebookCard style={styles.calendarModal} noPadding>
              <View style={styles.calendarHeader}>
                <TouchableOpacity 
                  onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  style={styles.calendarNavButton}
                >
                  <Text style={styles.calendarNav}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>
                  {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity 
                  onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  style={styles.calendarNavButton}
                >
                  <Text style={styles.calendarNav}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekdays}>
                {['D','L','M','M','J','V','S'].map((d, i) => (
                  <Text key={i} style={styles.weekdayText}>{d}</Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {getDaysInMonth(currentMonth).map((item, i) => {
                  if (!item) return <View key={`e-${i}`} style={styles.dayCell} />;
                  const isPast = isDateInPast(item.dateStr);
                  const isSelected = selectedDate === item.dateStr;
                  const isToday = item.dateStr === new Date().toISOString().split('T')[0];
                  return (
                    <TouchableOpacity 
                      key={item.dateStr}
                      style={[
                        styles.dayCell, 
                        isSelected && styles.dayCellSelected, 
                        isToday && !isSelected && styles.dayCellToday, 
                        isPast && styles.dayCellDisabled
                      ]}
                      onPress={() => !isPast && handleDateSelect(item.dateStr)} 
                      disabled={isPast}
                    >
                      <Text style={[
                        styles.dayText, 
                        isSelected && styles.dayTextSelected, 
                        isPast && styles.dayTextDisabled
                      ]}>
                        {item.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <FacebookButton
                title="Fermer"
                onPress={() => setShowCalendar(false)}
                variant="outline"
                fullWidth
              />
            </FacebookCard>
          </View>
        </Modal>

        {/* Fixed Bottom Buttons */}
        <View style={styles.bottomBar}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Text style={styles.backBtnText}>← Précédent</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <FacebookButton
                title="Continuer"
                onPress={handleNext}
                disabled={!canProceed}
                fullWidth
                variant="primary"
                size="large"
                icon={<Text style={{ color: colors.textWhite, fontSize: 18 }}>→</Text>}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalHeader: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: colors.textWhite,
    fontSize: 24,
    fontWeight: '600',
  },
  headerContent: {
    marginTop: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
  },
  progressBarActive: {
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  dateInput: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  dateInputIcon: {
    fontSize: 20,
  },
  dateInputText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  dateInputPlaceholder: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  calendarIcon: {
    fontSize: 20,
  },
  noSlotsCard: {
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  clockIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  noSlotsTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  noSlotsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingSlotsCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingSlotsText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    minWidth: 100,
    ...shadows.sm,
  },
  slotBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotBtnDisabled: {
    opacity: 0.4,
    backgroundColor: colors.borderLight,
  },
  slotText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  slotTextSelected: {
    color: colors.textWhite,
  },
  slotTextDisabled: {
    color: colors.textMuted,
  },
  slotAvailability: {
    fontSize: fontSize.xs,
    color: colors.success,
    marginTop: 2,
    fontWeight: '600',
  },
  slotFullText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: 2,
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minHeight: 100,
    ...shadows.sm,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  calendarModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: 40,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  calendarNavButton: {
    padding: spacing.md,
  },
  calendarNav: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: 'bold',
  },
  calendarTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellToday: {
    backgroundColor: colors.primaryLight,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.textWhite,
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: colors.textMuted,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
