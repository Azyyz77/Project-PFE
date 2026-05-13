import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../styles/theme';

interface FacebookStatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  backgroundColor?: string;
  iconColor?: string;
}

export const FacebookStatCard: React.FC<FacebookStatCardProps> = ({
  icon,
  label,
  value,
  trend,
  backgroundColor = colors.surface,
  iconColor = colors.primary,
}) => {
  return (
    <View style={[styles.card, { backgroundColor }, shadows.sm]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
            {icon}
          </View>
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <Text style={styles.value}>{value}</Text>
      
      {trend && (
        <View style={styles.trendContainer}>
          <Text
            style={[
              styles.trendText,
              { color: trend.isPositive ? colors.success : colors.error },
            ]}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  value: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
