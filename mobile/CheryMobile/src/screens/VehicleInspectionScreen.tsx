import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../context/LanguageContext';
import { getApiUrl } from '../config/env';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

type RoboflowPrediction = {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type RoboflowResponse = {
  success?: boolean;
  total?: number;
  predictions?: RoboflowPrediction[];
  image?: { width: number; height: number };
};

type DamageMeta = {
  label: string;
  color: string;
  severity: string;
  emoji: string;
};

const DAMAGE_META: Record<string, DamageMeta> = {
  scratch: { label: 'Rayure', color: '#F59E0B', severity: 'Mineur', emoji: '🔶' },
  dent: { label: 'Bosse', color: '#EF4444', severity: 'Modere', emoji: '🔴' },
  crack: { label: 'Fissure', color: '#8B5CF6', severity: 'Severe', emoji: '🟣' },
  broken: { label: 'Brise', color: '#DC2626', severity: 'Critique', emoji: '🚨' },
  damage: { label: 'Dommage', color: '#F97316', severity: 'Modere', emoji: '🟠' },
  hood: { label: 'Capot', color: '#3B82F6', severity: 'Zone', emoji: '🔵' },
  trunk: { label: 'Coffre', color: '#3B82F6', severity: 'Zone', emoji: '🔵' },
  wheel: { label: 'Roue', color: '#6B7280', severity: 'Zone', emoji: '⚪' },
  front_bumper: { label: 'Pare-chocs av', color: '#F97316', severity: 'Modere', emoji: '🟠' },
  back_bumper: { label: 'Pare-chocs ar', color: '#F97316', severity: 'Modere', emoji: '🟠' }
};

const getMeta = (cls: string): DamageMeta =>
  DAMAGE_META[cls?.toLowerCase()] ?? { label: cls, color: '#6B7280', severity: 'Inconnu', emoji: '⚪' };

const formatPredictions = (predictions: RoboflowPrediction[]) =>
  predictions.map((p) => ({
    class: p.class,
    label: getMeta(p.class).label,
    severity: getMeta(p.class).severity,
    confidence: Math.round(p.confidence * 100),
    x: Math.round(p.x),
    y: Math.round(p.y)
  }));

export default function VehicleInspectionScreen() {
  const { t } = useLanguage();
  const [file, setFile] = useState<UploadFile | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoboflowResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenWeb = () => {
    const apiUrl = getApiUrl();
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl.replace(/\/$/, '');
    Linking.openURL(`${baseUrl}/client/vehicle-inspection`).catch(() => undefined);
  };

  const uploadUrl = useMemo(() => {
    const apiUrl = getApiUrl();
    return `${apiUrl.replace(/\/$/, '')}/detect/upload`;
  }, []);

  const pickImage = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const resultPicker = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9
    });

    if (resultPicker.canceled || !resultPicker.assets?.length) return;

    const asset = resultPicker.assets[0];
    const name = asset.fileName || `inspection-${Date.now()}.jpg`;
    const type = asset.mimeType || 'image/jpeg';

    setFile({ uri: asset.uri, name, type });
    setPreview(asset.uri);
    setResult(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: file.uri,
        name: file.name,
        type: file.type
      } as unknown as Blob);

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);

      const data: RoboflowResponse = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const formatted = useMemo(() => {
    const predictions = result?.predictions || [];
    return formatPredictions(predictions);
  }, [result]);

  const reportMeta = useMemo(() => {
    if (!result) return null;
    const total = result.total ?? (result.predictions?.length || 0);
    return {
      date: new Date().toLocaleString('fr-FR'),
      fileName: file?.name || '',
      total,
      critical: formatted.some((d) => d.severity === 'Critique')
    };
  }, [result, file?.name, formatted]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('inspection.title')}</Text>
        <Text style={styles.subtitle}>{t('inspection.subtitle')}</Text>
        <Text style={styles.description}>{t('inspection.description')}</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {preview ? (
            <Image source={{ uri: preview }} style={styles.preview} />
          ) : (
            <Text style={styles.imagePickerText}>{t('inspection.pickImage')}</Text>
          )}
        </TouchableOpacity>

        {preview && (
          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <Text style={styles.secondaryButtonText}>{t('inspection.changeImage')}</Text>
          </TouchableOpacity>
        )}

        {preview && (
          <TouchableOpacity style={styles.button} onPress={analyze} disabled={loading}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.buttonText}>{t('inspection.analyzing')}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t('inspection.analyze')}</Text>
            )}
          </TouchableOpacity>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>{t('inspection.errorTitle')}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>{t('inspection.errorHint')}</Text>
          </View>
        )}

        {reportMeta && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryIcon}>
                {reportMeta.critical ? '🔴' : reportMeta.total > 0 ? '🟡' : '🟢'}
              </Text>
              <View style={styles.summaryBody}>
                <Text style={styles.summaryTitle}>
                  {reportMeta.total === 0
                    ? t('inspection.noDamage')
                    : `${reportMeta.total} ${reportMeta.total > 1 ? t('inspection.damageDetectedPlural') : t('inspection.damageDetected')}`}
                </Text>
                <Text style={styles.summarySub}>{reportMeta.date} {reportMeta.fileName ? `· ${reportMeta.fileName}` : ''}</Text>
              </View>
              {reportMeta.critical && (
                <Text style={styles.criticalBadge}>{t('inspection.critical')}</Text>
              )}
            </View>
          </View>
        )}

        {formatted.length > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>{t('inspection.resultsTitle')}</Text>
            {formatted.map((d, index) => {
              const meta = getMeta(d.class);
              return (
                <View key={`${d.class}-${index}`} style={styles.resultRow}>
                  <View style={[styles.dot, { backgroundColor: meta.color }]} />
                  <View style={styles.resultBody}>
                    <Text style={styles.resultLabel}>{meta.emoji} {d.label}</Text>
                    <Text style={styles.resultMeta}>
                      {t('inspection.severity')}: {d.severity} · {t('inspection.confidence')}: {d.confidence}%
                    </Text>
                    <Text style={styles.resultMeta}>{t('inspection.position')}: x:{d.x} y:{d.y}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={styles.webButton} onPress={handleOpenWeb}>
          <Text style={styles.webButtonText}>{t('inspection.openWeb')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  description: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
  },
  imagePicker: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC'
  },
  imagePickerText: {
    fontSize: 14,
    color: colors.textMuted
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    resizeMode: 'cover'
  },
  secondaryButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600'
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  errorBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  errorTitle: {
    fontWeight: '700',
    color: '#B91C1C'
  },
  errorText: {
    marginTop: 4,
    color: '#EF4444',
    fontSize: 12
  },
  errorHint: {
    marginTop: 4,
    color: '#7F1D1D',
    fontSize: 11
  },
  summaryCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F1F5F9'
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: spacing.md
  },
  summaryBody: {
    flex: 1
  },
  summaryTitle: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  summarySub: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted
  },
  criticalBadge: {
    backgroundColor: '#DC2626',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  resultsCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  resultsTitle: {
    fontWeight: '700',
    marginBottom: spacing.md
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: spacing.sm
  },
  resultBody: {
    flex: 1
  },
  resultLabel: {
    fontWeight: '600',
    color: colors.textPrimary
  },
  resultMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  webButton: {
    marginTop: spacing.lg,
    alignItems: 'center'
  },
  webButtonText: {
    color: colors.primary,
    fontWeight: '600'
  }
});
