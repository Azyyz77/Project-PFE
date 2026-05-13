import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import api from '../config/api';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { FacebookButton, FacebookInput, FacebookCard } from '../components/facebook';

export default function AddVehicleScreen({ navigation }: any) {
  const { brands, versionsCatalog, colors: availableColors, loadingBooking, loadBookingData, loadUserData } = useData();

  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [annee, setAnnee] = useState('');
  const [couleur, setCouleur] = useState('');
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [kilometrage, setKilometrage] = useState('');
  const [imageVehicule, setImageVehicule] = useState('');
  const [imageCarteGrise, setImageCarteGrise] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Real-time validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => { loadBookingData(); }, []);

  const filteredModels = selectedBrandId
    ? Array.from(new Set(versionsCatalog.filter((v: any) => String(v.marque_id) === selectedBrandId).map((v: any) => v.modele_nom)))
    : [];

  const filteredVersions = selectedBrandId && selectedModelName
    ? versionsCatalog.filter((v: any) => String(v.marque_id) === selectedBrandId && v.modele_nom === selectedModelName)
    : [];

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!selectedBrandId) newErrors.brand = 'Veuillez sélectionner une marque';
    if (!selectedModelName) newErrors.model = 'Veuillez sélectionner un modèle';
    if (!selectedVersionId) newErrors.version = 'Veuillez sélectionner une version';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!immatriculation.trim()) {
      newErrors.immatriculation = 'L\'immatriculation est requise';
    } else {
      const tunisRegex = /^(\d{1,3})\s*تونس\s*(\d{1,4})$/u;
      const ntRegex = /^(\d{1,5})\s*ن\.ت$/u;
      const sivRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
      const customRegex = /^\d{3}-[A-Z]{2}-\d{3}$/;
      
      const trimmedImmat = immatriculation.trim();
      
      // Auto-uppercase for SIV and CUSTOM
      const isSivLike = /^[A-Za-z]{2}-\d{3}-[A-Za-z]{2}$/.test(trimmedImmat);
      const isCustomLike = /^\d{3}-[A-Za-z]{2}-\d{3}$/.test(trimmedImmat);
      const hasSpaces = /\s/.test(trimmedImmat);

      if (isSivLike || isCustomLike) {
        if (hasSpaces) {
          newErrors.immatriculation = 'Les espaces ne sont pas autorisés';
        } else if (!sivRegex.test(trimmedImmat) && !customRegex.test(trimmedImmat)) {
           newErrors.immatriculation = 'Veuillez utiliser des majuscules. Ex: AB-123-CD';
        }
      } else if (!tunisRegex.test(trimmedImmat) && !ntRegex.test(trimmedImmat) && !sivRegex.test(trimmedImmat) && !customRegex.test(trimmedImmat)) {
        newErrors.immatriculation = 'Format invalide. Ex: "123 تونس 456", "12345 ن.ت", "AB-123-CD", "123-AB-123"';
      }
    }

    if (!numeroSerie.trim()) {
      newErrors.numeroSerie = 'Le numéro de châssis est requis';
    } else if (numeroSerie.trim().length > 17) {
      newErrors.numeroSerie = 'Maximum 17 caractères';
    }

    if (!annee.trim()) {
      newErrors.annee = 'L\'année est requise';
    } else {
      const yearNum = Number(annee);
      if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2100) {
        newErrors.annee = 'Année invalide (1950–2100)';
      }
    }

    if (!couleur.trim()) {
      newErrors.couleur = 'La couleur est requise';
    }

    if (kilometrage && (isNaN(Number(kilometrage)) || Number(kilometrage) < 0)) {
      newErrors.kilometrage = 'Kilométrage invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!imageCarteGrise) newErrors.imageCarteGrise = 'La photo de la carte grise est obligatoire pour la validation';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAdd = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    const trimmedImmat = immatriculation.trim();
    const yearNum = Number(annee);
    try {
      await api.post('/vehicles', {
        version_id: Number(selectedVersionId),
        immatriculation: trimmedImmat,
        numero_chassis: numeroSerie.trim(),
        annee: yearNum,
        couleur: couleur.trim(),
        kilometrage: kilometrage ? Number(kilometrage) : undefined,
        image_vehicule: imageVehicule || undefined,
        image_carte_grise: imageCarteGrise,
      });
      Alert.alert('Succès', 'Véhicule ajouté ! Il sera visible après validation par un agent SAV.', [
        { text: 'OK', onPress: () => { loadUserData(); navigation.navigate('Vehicles'); } }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || error.response?.data?.error || 'Impossible d\'ajouter le véhicule');
    } finally { setLoading(false); }
  };

  if (loadingBooking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => currentStep > 1 ? prevStep() : navigation.goBack()} style={styles.backButton} accessibilityLabel="Retour" accessibilityRole="button">
            <Text style={styles.backButtonText}>← {currentStep > 1 ? 'Précédent' : 'Retour'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un véhicule</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Étape {currentStep} sur {totalSteps}</Text>
        </View>

        {/* Info Banner */}
        <FacebookCard style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>Tous les champs marqués d'un * sont obligatoires</Text>
        </FacebookCard>

        {/* --- STEP 1: Modèle --- */}
        {currentStep === 1 && (
          <View>
            <Text style={styles.sectionTitle}>1. Informations du modèle</Text>
            
            <Text style={styles.sectionLabel}>Marque *</Text>
            <View style={styles.optionsContainer}>
              {brands.map((brand: any, index: number) => (
                <TouchableOpacity 
                  key={brand.id ? brand.id.toString() : `brand-${index}`}
                  style={[
                    styles.option, 
                    selectedBrandId === String(brand.id) && styles.optionSelected,
                    errors.brand ? styles.optionError : null
                  ]}
                  onPress={() => { 
                    setSelectedBrandId(String(brand.id)); 
                    setSelectedModelName(''); 
                    setSelectedVersionId('');
                    setErrors({ ...errors, brand: '' });
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedBrandId === String(brand.id) }}
                >
                  <Text style={[
                    styles.optionText, 
                    selectedBrandId === String(brand.id) && styles.optionTextSelected
                  ]}>
                    {brand.nom}
                  </Text>
                  {selectedBrandId === String(brand.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}

            {/* Modèle */}
            {selectedBrandId && filteredModels.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Modèle *</Text>
                <View style={styles.optionsContainer}>
                  {filteredModels.map((modelName: string, index: number) => (
                    <TouchableOpacity 
                      key={modelName || `model-${index}`}
                      style={[
                        styles.option, 
                        selectedModelName === modelName && styles.optionSelected,
                        errors.model ? styles.optionError : null
                      ]}
                      onPress={() => { 
                        setSelectedModelName(modelName); 
                        setSelectedVersionId(''); 
                        setErrors({ ...errors, model: '' });
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selectedModelName === modelName }}
                    >
                      <Text style={[
                        styles.optionText, 
                        selectedModelName === modelName && styles.optionTextSelected
                      ]}>
                        {modelName}
                      </Text>
                      {selectedModelName === modelName && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
              </>
            )}

            {/* Version */}
            {selectedModelName && filteredVersions.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Version *</Text>
                <View style={styles.optionsContainer}>
                  {filteredVersions.map((v: any, index: number) => (
                    <TouchableOpacity 
                      key={v.version_id ? v.version_id.toString() : `version-${index}`}
                      style={[
                        styles.option, 
                        selectedVersionId === String(v.version_id) && styles.optionSelected,
                        errors.version ? styles.optionError : null
                      ]}
                      onPress={() => {
                        setSelectedVersionId(String(v.version_id));
                        setErrors({ ...errors, version: '' });
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selectedVersionId === String(v.version_id) }}
                    >
                      <Text style={[
                        styles.optionText, 
                        selectedVersionId === String(v.version_id) && styles.optionTextSelected
                      ]}>
                        {v.version_nom}
                      </Text>
                      {selectedVersionId === String(v.version_id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.version && <Text style={styles.errorText}>{errors.version}</Text>}
              </>
            )}

            <View style={styles.stepButtonContainer}>
              <FacebookButton title="Suivant" onPress={nextStep} variant="primary" size="large" fullWidth />
            </View>
          </View>
        )}

        {/* --- STEP 2: Identification --- */}
        {currentStep === 2 && (
          <View>
            <Text style={styles.sectionTitle}>2. Identification du véhicule</Text>
            
            {/* Immatriculation */}
            <Text style={styles.sectionLabel}>Immatriculation *</Text>
            <View style={styles.immatButtons}>
              <TouchableOpacity 
                style={styles.immatBtn} 
                onPress={() => { setImmatriculation(' تونس '); setErrors({ ...errors, immatriculation: '' }); }}
              >
                <Text style={styles.immatBtnText}>+ تونس</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.immatBtn} 
                onPress={() => { setImmatriculation(' ن.ت'); setErrors({ ...errors, immatriculation: '' }); }}
              >
                <Text style={styles.immatBtnText}>+ ن.ت</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.immatBtn} 
                onPress={() => { setImmatriculation('AB-123-CD'); setErrors({ ...errors, immatriculation: '' }); }}
              >
                <Text style={styles.immatBtnText}>+ SIV</Text>
              </TouchableOpacity>
            </View>
            <FacebookInput
              placeholder='Ex: 123 تونس 456, 12345 ن.ت, AB-123-CD'
              value={immatriculation} 
              onChangeText={(text: string) => { 
                // Auto capitalize to help user
                const upperText = text.replace(/[a-z]/g, c => c.toUpperCase());
                setImmatriculation(upperText); 
                setErrors({ ...errors, immatriculation: '' }); 
              }}
            />
            {errors.immatriculation && <Text style={styles.errorText}>{errors.immatriculation}</Text>}
            <FacebookCard style={styles.hintBox}>
              <Text style={styles.hintText}>Formats: "123 تونس 4567", "12345 ن.ت", "AB-123-CD", "123-AB-123"</Text>
            </FacebookCard>

            {/* Numéro de châssis */}
            <FacebookInput
              label="Numéro de châssis *"
              placeholder="17 caractères maximum"
              value={numeroSerie} 
              onChangeText={(text: string) => { 
                if (text.length <= 17) {
                  setNumeroSerie(text); 
                  setErrors({ ...errors, numeroSerie: '' }); 
                }
              }} 
            />
            {errors.numeroSerie && <Text style={styles.errorText}>{errors.numeroSerie}</Text>}
            <Text style={styles.charCount}>{numeroSerie.length}/17 caractères</Text>

            {/* Année */}
            <FacebookInput
              label="Année *"
              placeholder="Ex: 2020 (entre 1950 et 2100)"
              value={annee} 
              onChangeText={(text: string) => { 
                if (text.length <= 4) {
                  setAnnee(text); 
                  setErrors({ ...errors, annee: '' }); 
                }
              }} 
              keyboardType="numeric"
            />
            {errors.annee && <Text style={styles.errorText}>{errors.annee}</Text>}

            {/* Couleur */}
            <Text style={styles.sectionLabel}>Couleur *</Text>
            <TouchableOpacity 
              style={[styles.dropdownButton, errors.couleur ? styles.optionError : null]} 
              onPress={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isColorDropdownOpen }}
            >
              <Text style={couleur ? styles.dropdownButtonTextSelected : styles.dropdownButtonText}>
                {couleur || 'Sélectionnez une couleur'}
              </Text>
              <Text style={styles.dropdownIcon}>{isColorDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {errors.couleur && <Text style={styles.errorText}>{errors.couleur}</Text>}

            {isColorDropdownOpen && (
              <View style={styles.dropdownList}>
                {(availableColors || []).map((c: any, index: number) => (
                  <TouchableOpacity 
                    key={c.id ? c.id.toString() : index.toString()}
                    style={[styles.dropdownItem, couleur === c.nom && styles.dropdownItemSelected]}
                    onPress={() => { setCouleur(c.nom); setIsColorDropdownOpen(false); setErrors({ ...errors, couleur: '' }); }}
                  >
                    <Text style={[styles.dropdownItemText, couleur === c.nom && styles.dropdownItemTextSelected]}>
                      {c.nom}
                    </Text>
                    {couleur === c.nom && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Kilométrage */}
            <FacebookInput
              label="Kilométrage (optionnel)"
              placeholder="Ex: 50000"
              value={kilometrage} 
              onChangeText={(text: string) => { setKilometrage(text); setErrors({ ...errors, kilometrage: '' }); }} 
              keyboardType="numeric"
            />
            {errors.kilometrage && <Text style={styles.errorText}>{errors.kilometrage}</Text>}

            <View style={styles.stepButtonContainer}>
              <FacebookButton title="Suivant" onPress={nextStep} variant="primary" size="large" fullWidth />
            </View>
          </View>
        )}

        {/* --- STEP 3: Photos et Validation --- */}
        {currentStep === 3 && (
          <View>
            <Text style={styles.sectionTitle}>3. Documents et Photos</Text>

            {/* Photo Carte Grise */}
            <Text style={styles.sectionLabel}>Photo de la carte grise *</Text>
            <FacebookCard style={errors.imageCarteGrise ? [styles.imageUploadCard, styles.optionError] as any : styles.imageUploadCard}>
              <Text style={styles.imageUploadIcon}>📄</Text>
              <Text style={styles.imageUploadTitle}>Carte grise</Text>
              <Text style={styles.imageUploadSubtitle}>
                {imageCarteGrise ? '✓ Image ajoutée' : 'Requis pour validation'}
              </Text>
              <TouchableOpacity 
                style={styles.imageUploadButton}
                onPress={() => {
                  Alert.alert('Upload', 'Fonctionnalité d\'upload d\'image à implémenter avec react-native-image-picker');
                  // Fake upload for testing purposes:
                  // setImageCarteGrise('fake_uri');
                  // setErrors({ ...errors, imageCarteGrise: '' });
                }}
              >
                <Text style={styles.imageUploadButtonText}>
                  {imageCarteGrise ? 'Changer l\'image' : '+ Ajouter une photo'}
                </Text>
              </TouchableOpacity>
            </FacebookCard>
            {errors.imageCarteGrise && <Text style={styles.errorText}>{errors.imageCarteGrise}</Text>}

            {/* Photo Véhicule */}
            <Text style={styles.sectionLabel}>Photo du véhicule (optionnel)</Text>
            <FacebookCard style={styles.imageUploadCard}>
              <Text style={styles.imageUploadIcon}>📷</Text>
              <Text style={styles.imageUploadTitle}>Photo du véhicule</Text>
              <Text style={styles.imageUploadSubtitle}>
                {imageVehicule ? '✓ Image ajoutée' : 'Optionnel'}
              </Text>
              <TouchableOpacity 
                style={styles.imageUploadButton}
                onPress={() => Alert.alert('Upload', 'Fonctionnalité d\'upload d\'image à implémenter avec react-native-image-picker')}
              >
                <Text style={styles.imageUploadButtonText}>
                  {imageVehicule ? 'Changer l\'image' : '+ Ajouter une photo'}
                </Text>
              </TouchableOpacity>
            </FacebookCard>

            {/* Warning Banner */}
            <FacebookCard style={styles.warningBanner}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Votre véhicule sera soumis à validation par un agent SAV avant d'être utilisable.
              </Text>
            </FacebookCard>

            {/* Submit Button */}
            <View style={styles.stepButtonContainer}>
              <FacebookButton
                title="Ajouter le véhicule"
                onPress={handleAdd}
                loading={loading}
                disabled={loading}
                fullWidth
                variant="primary"
                size="large"
              />
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  immatButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  immatBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  immatBtnText: {
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  hintBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  hintText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  dropdownButton: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dropdownButtonText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  dropdownButtonTextSelected: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  dropdownIcon: {
    color: colors.textMuted,
    fontSize: 12,
  },
  dropdownList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownItemText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xxxl,
    marginBottom: spacing.lg,
  },
  imageUploadCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imageUploadIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  imageUploadTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  imageUploadSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  imageUploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  imageUploadButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#856404',
    fontWeight: '600',
  },
  stepButtonContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
