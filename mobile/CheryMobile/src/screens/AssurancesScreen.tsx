import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

export default function AssurancesScreen() {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('assurances.title')}</Text>
        <Text style={styles.subtitle}>{t('assurances.subtitle')}</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{t('assurances.comingSoon')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
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
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  notice: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.md,
  },
  noticeText: {
    color: '#1D4ED8',
    fontSize: 13,
  },
});
