import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import api from '../config/api';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

export default function AddVehicleScreen({ navigation }: any) {
  const { brands, versionsCatalog, loadingBooking, loadBookingData, loadUserData } = useData();

  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [annee, setAnnee] = useState('');
  const [couleur, setCouleur] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBookingData(); }, []);

  const filteredModels = selectedBrandId
    ? Array.from(new Set(versionsCatalog.filter((v: any) => String(v.marque_id) === selectedBrandId).map((v: any) => v.modele_nom)))
    : [];

  const filteredVersions = selectedBrandId && selectedModelName
    ? versionsCatalog.filter((v: any) => String(v.marque_id) === selectedBrandId && v.modele_nom === selectedModelName)
    : [];

  const handleAdd = async () => {
    const errors: string[] = [];
    if (!selectedBrandId) errors.push('• Marque requise');
    if (!selectedModelName) errors.push('• Modèle requis');
    if (!selectedVersionId) errors.push('• Version requise');
    if (!immatriculation.trim()) errors.push('• Immatriculation requise');
    if (!numeroSerie.trim()) errors.push('• Numéro de châssis requis');
    if (!annee.trim()) errors.push('• Année requise');
    if (errors.length > 0) { Alert.alert('Champs manquants', errors.join('\n')); return; }

    const tunisRegex = /^(\d{1,3})\s*تونس\s*(\d{1,3})$/u;
    const ntRegex = /^(\d{1,5})\s*ن\.ت$/u;
    const trimmedImmat = immatriculation.trim();
    if (!tunisRegex.test(trimmedImmat) && !ntRegex.test(trimmedImmat)) {
      Alert.alert('Format invalide', 'Format accepté :\n• Tunis: "123 تونس 456"\n• NT: "12345 ن.ت"'); return;
    }
    if (numeroSerie.trim().length > 17) { Alert.alert('Erreur', 'Le numéro de châssis ne doit pas dépasser 17 caractères'); return; }
    const yearNum = Number(annee);
    if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2100) { Alert.alert('Erreur', 'Année invalide (1950–2100)'); return; }

    setLoading(true);
    try {
      await api.post('/vehicles', {
        version_id: Number(selectedVersionId),
        immatriculation: trimmedImmat,
        numero_chassis: numeroSerie.trim(),
        annee: yearNum,
        couleur: couleur ? couleur.trim() : undefined,
      });
      Alert.alert('Succès', 'Véhicule ajouté ! Il sera visible après validation par un agent SAV.', [
        { text: 'OK', onPress: () => { loadUserData(); navigation.navigate('Vehicles'); } }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || error.response?.data?.error || 'Impossible d\'ajouter le véhicule');
    } finally { setLoading(false); }
  };

  if (loadingBooking) {
    return <View style={commonStyles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={commonStyles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={commonStyles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Ajouter un véhicule</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>ℹ️ Tous les champs marqués d'un * sont obligatoires</Text>
        </View>

        {/* Marque */}
        <Text style={styles.sectionLabel}>Marque *</Text>
        {brands.map((brand: any) => (
          <TouchableOpacity key={brand.id}
            style={[styles.option, selectedBrandId === String(brand.id) && styles.optionSelected]}
            onPress={() => { setSelectedBrandId(String(brand.id)); setSelectedModelName(''); setSelectedVersionId(''); }}>
            <Text style={[styles.optionText, selectedBrandId === String(brand.id) && styles.optionTextSelected]}>
              {brand.nom}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Modèle */}
        {selectedBrandId && filteredModels.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Modèle *</Text>
            {filteredModels.map((modelName: string, i: number) => (
              <TouchableOpacity key={i}
                style={[styles.option, selectedModelName === modelName && styles.optionSelected]}
                onPress={() => { setSelectedModelName(modelName); setSelectedVersionId(''); }}>
                <Text style={[styles.optionText, selectedModelName === modelName && styles.optionTextSelected]}>{modelName}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Version */}
        {selectedModelName && filteredVersions.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Version *</Text>
            {filteredVersions.map((v: any) => (
              <TouchableOpacity key={v.version_id}
                style={[styles.option, selectedVersionId === String(v.version_id) && styles.optionSelected]}
                onPress={() => setSelectedVersionId(String(v.version_id))}>
                <Text style={[styles.optionText, selectedVersionId === String(v.version_id) && styles.optionTextSelected]}>
                  {v.version_nom}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Immatriculation */}
        <Text style={styles.sectionLabel}>Immatriculation *</Text>
        <View style={styles.immatButtons}>
          <TouchableOpacity style={styles.immatBtn} onPress={() => setImmatriculation(' تونس ')}>
            <Text style={styles.immatBtnText}>+ تونس</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.immatBtn} onPress={() => setImmatriculation(' ن.ت')}>
            <Text style={styles.immatBtnText}>+ ن.ت</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder='Ex: 123 تونس 456 ou 12345 ن.ت'
          placeholderTextColor={colors.textMuted}
          value={immatriculation} onChangeText={setImmatriculation} />
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>Format: "123 تونس 456" ou "12345 ن.ت"</Text>
        </View>

        {/* Numéro de châssis */}
        <Text style={styles.sectionLabel}>Numéro de châssis *</Text>
        <TextInput
          style={styles.input}
          placeholder="17 caractères maximum"
          placeholderTextColor={colors.textMuted}
          value={numeroSerie} onChangeText={setNumeroSerie} maxLength={17} />
        <Text style={styles.charCount}>{numeroSerie.length}/17 caractères</Text>

        {/* Année */}
        <Text style={styles.sectionLabel}>Année *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2020 (entre 1950 et 2100)"
          placeholderTextColor={colors.textMuted}
          value={annee} onChangeText={setAnnee} keyboardType="numeric" maxLength={4} />

        {/* Couleur */}
        <Text style={styles.sectionLabel}>Couleur (optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Blanc, Noir, Rouge..."
          placeholderTextColor={colors.textMuted}
          value={couleur} onChangeText={setCouleur} maxLength={50} />

        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ Votre véhicule sera soumis à validation par un agent SAV avant d'être utilisable.</Text>
        </View>

        <TouchableOpacity
          style={[commonStyles.modernButton, loading && { opacity: 0.6 }, { marginTop: spacing.xl, marginBottom: 40 }]}
          onPress={handleAdd} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.modernButtonText}>Ajouter le véhicule</Text>}
        </TouchableOpacity>
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
  input: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.md, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, marginBottom: spacing.xs },
  infoBanner: { backgroundColor: '#FEF3C7', padding: spacing.md, borderRadius: borderRadius.sm, marginBottom: spacing.md },
  infoText: { fontSize: fontSize.sm, color: '#92400E', fontWeight: '600' },
  warningBanner: { backgroundColor: '#FEF3C7', padding: spacing.md, borderRadius: borderRadius.sm, marginTop: spacing.xl },
  warningText: { fontSize: fontSize.sm, color: '#92400E' },
  immatButtons: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  immatBtn: { flex: 1, backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.sm, alignItems: 'center' },
  immatBtnText: { color: '#fff', fontWeight: '600', fontSize: fontSize.base },
  hintBox: { backgroundColor: '#DBEAFE', padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.sm },
  hintText: { fontSize: fontSize.xs, color: '#1E40AF' },
  charCount: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.xs },
});
