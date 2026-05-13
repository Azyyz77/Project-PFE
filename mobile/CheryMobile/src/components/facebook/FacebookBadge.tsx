import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../styles/theme';

interface FacebookBadgeProps {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'small' | 'medium';
}

export const FacebookBadge: React.FC<FacebookBadgeProps> = ({
  label,
  variant,
  size = 'medium',
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#E5F5E0', text: colors.success };
      case 'warning':
        return { bg: '#FFF3CD', text: '#856404' };
      case 'error':
        return { bg: '#FFEBE9', text: colors.error };
      case 'info':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'default':
      default:
        return { bg: colors.border, text: colors.textSecondary };
    }
  };

  const badgeColors = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeColors.bg },
        size === 'small' && styles.badgeSmall,
      ]}>
      <Text
        style={[
          styles.badgeText,
          { color: badgeColors.text },
          size === 'small' && styles.badgeTextSmall,
        ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextSmall: {
    fontSize: 9,
  },
});
