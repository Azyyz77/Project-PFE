/**
 * Facebook-Inspired Theme for Chery Mobile App
 * Matching the web client design with Facebook Blue (#1877F2)
 */

export const colors = {
  // Facebook Primary Colors
  primary: '#1877F2',        // Facebook Blue
  primaryDark: '#166FE5',    // Darker blue for pressed states
  primaryLight: '#E7F3FF',   // Light blue for backgrounds
  
  // Status colors (Facebook-style)
  success: '#42B72A',        // Facebook Green
  warning: '#F7B928',        // Facebook Yellow
  error: '#F02849',          // Facebook Red
  info: '#1877F2',           // Facebook Blue
  
  // Neutral colors (Facebook palette)
  background: '#F0F2F5',     // Facebook Light Gray
  surface: '#FFFFFF',        // Pure White
  border: '#E4E6EB',         // Facebook Border Gray
  borderLight: '#CED0D4',    // Lighter border
  
  // Text colors (Facebook)
  textPrimary: '#050505',    // Facebook Black
  textSecondary: '#65676B',  // Facebook Gray
  textMuted: '#8A8D91',      // Muted Gray
  textLight: '#B0B3B8',      // Light Gray
  textWhite: '#FFFFFF',      // White text
  
  // Service card backgrounds (Facebook-inspired)
  purple: '#F3E8FF',
  blue: '#E7F3FF',
  yellow: '#FFF3CD',
  green: '#E5F5E0',
  teal: '#CCFBF1',
  orange: '#FFE5D9',
  indigo: '#E0E7FF',
  pink: '#FCE7F3',
  
  // Status badge colors (Facebook-style)
  statusPlanned: { bg: '#E7F3FF', text: '#1877F2' },
  statusInProgress: { bg: '#FFF3CD', text: '#856404' },
  statusCompleted: { bg: '#E5F5E0', text: '#42B72A' },
  statusCancelled: { bg: '#FFEBE9', text: '#F02849' },
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
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};
