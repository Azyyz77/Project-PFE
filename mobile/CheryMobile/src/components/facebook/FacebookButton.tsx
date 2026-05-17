import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../styles/theme';

interface FacebookButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const FacebookButton: React.FC<FacebookButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  size = 'medium',
  style,
}) => {
  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button];
    
    if (fullWidth) baseStyle.push(styles.fullWidth);
    
    // Size styles
    if (size === 'small') baseStyle.push(styles.buttonSmall);
    if (size === 'large') baseStyle.push(styles.buttonLarge);
    
    // Variant styles
    if (variant === 'primary') {
      baseStyle.push(styles.buttonPrimary);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.buttonSecondary);
    } else if (variant === 'outline') {
      baseStyle.push(styles.buttonOutline);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: any[] = [styles.buttonText];
    
    // Size styles
    if (size === 'small') baseStyle.push(styles.textSmall);
    if (size === 'large') baseStyle.push(styles.textLarge);
    
    // Variant styles
    if (variant === 'primary') {
      baseStyle.push(styles.textPrimary);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.textSecondary);
    } else if (variant === 'outline') {
      baseStyle.push(styles.textOutline);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.textWhite : colors.primary} 
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  fullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.border,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: fontSize.sm,
  },
  textLarge: {
    fontSize: fontSize.lg,
  },
  textPrimary: {
    color: colors.textWhite,
  },
  textSecondary: {
    color: colors.textPrimary,
  },
  textOutline: {
    color: colors.primary,
  },
});
