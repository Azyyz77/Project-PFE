/**
 * Design System - Centralized color, spacing, and typography tokens
 */

export const colors = {
  // Primary
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6', // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#0c2340',
  },
  // Status colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    600: '#dc2626',
    700: '#b91c1c',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px
};

export const typography = {
  heading: {
    h1: { size: '2rem', weight: 700, lineHeight: '2.5rem' },
    h2: { size: '1.5rem', weight: 700, lineHeight: '2rem' },
    h3: { size: '1.25rem', weight: 600, lineHeight: '1.75rem' },
    h4: { size: '1rem', weight: 600, lineHeight: '1.5rem' },
  },
  body: {
    large: { size: '1rem', weight: 400, lineHeight: '1.5rem' },
    base: { size: '0.875rem', weight: 400, lineHeight: '1.25rem' },
    small: { size: '0.75rem', weight: 400, lineHeight: '1rem' },
  },
};

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
  full: '9999px',
};
