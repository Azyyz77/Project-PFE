import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

interface FacebookCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
  noShadow?: boolean;
}

export const FacebookCard: React.FC<FacebookCardProps> = ({
  children,
  onPress,
  style,
  noPadding = false,
  noShadow = false,
}) => {
  const cardStyle = [
    styles.card,
    !noPadding && styles.cardPadding,
    !noShadow && shadows.sm,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPadding: {
    padding: spacing.lg,
  },
});
