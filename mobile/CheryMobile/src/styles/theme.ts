// Theme colors and constants
export const colors = {
  // Primary colors
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Neutral colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Text colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  
  // Service card backgrounds
  purple: '#EDE9FE',
  blue: '#DBEAFE',
  yellow: '#FEF3C7',
  green: '#D1FAE5',
  teal: '#CCFBF1',
  orange: '#FED7AA',
  indigo: '#E0E7FF',
  pink: '#FCE7F3',
  
  // Status badge colors
  statusPlanned: { bg: '#DBEAFE', text: '#1E40AF' },
  statusInProgress: { bg: '#FEF3C7', text: '#92400E' },
  statusCompleted: { bg: '#D1FAE5', text: '#065F46' },
  statusCancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};
