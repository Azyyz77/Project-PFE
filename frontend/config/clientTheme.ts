import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

/**
 * Facebook-Inspired Theme for Chery Tunisia
 * Clean, minimal, and familiar design system inspired by Facebook's UI.
 * Primary Color: #1877F2 (Facebook Blue)
 */

export const clientTheme = {
  // Facebook-Style Palette
  background: {
    primary: 'bg-[#F0F2F5]',        // Facebook Light Gray
    secondary: 'bg-white',          // Pure White
    tertiary: 'bg-[#E4E6EB]',       // Facebook Lighter Gray
    hover: 'hover:bg-[#F2F3F5]',    
    dark: 'bg-[#18191A]',           // Facebook Dark Mode
    blue: 'bg-[#1877F2]',           // Facebook Blue
    green: 'bg-[#42B72A]',          // Facebook Green
    red: 'bg-[#F02849]',            // Facebook Red
    yellow: 'bg-[#F7B928]'          // Facebook Yellow
  },

  // Facebook Borders
  border: {
    primary: 'border-[#CED0D4]',
    secondary: 'border-[#E4E6EB]',
    hover: 'hover:border-[#1877F2]',
  },

  // Facebook Typography
  text: {
    primary: 'text-[#050505]',      // Facebook Black
    secondary: 'text-[#65676B]',    // Facebook Gray
    tertiary: 'text-[#8A8D91]',     
    muted: 'text-[#B0B3B8]',        
    accent: 'text-[#1877F2]',       // Facebook Blue
  },

  // Facebook Buttons
  button: {
    primary: 'bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold px-6 py-2.5 rounded-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50',
    secondary: 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold px-6 py-2.5 rounded-md transition-all duration-200 active:scale-[0.98]',
    outline: 'border border-[#CED0D4] text-[#050505] hover:bg-[#F2F3F5] font-semibold px-6 py-2.5 rounded-md transition-all duration-200 active:scale-[0.98]',
    danger: 'bg-[#F02849] hover:bg-[#D91F3C] text-white font-semibold px-6 py-2.5 rounded-md transition-all duration-200',
    success: 'bg-[#42B72A] hover:bg-[#36A420] text-white font-semibold px-6 py-2.5 rounded-md transition-all duration-200',
    small: 'px-4 py-1.5 text-sm',
    large: 'px-8 py-3 text-base',
  },

  // Facebook Cards
  card: {
    base: 'bg-white border border-[#E4E6EB] rounded-lg shadow-sm overflow-hidden',
    hover: 'hover:shadow-md transition-all duration-200',
    padding: 'p-4',
    header: 'border-b border-[#E4E6EB] pb-3 mb-3',
  },

  // Facebook Inputs
  input: {
    base: 'w-full px-4 py-2.5 bg-[#F0F2F5] border border-transparent rounded-md text-[#050505] placeholder-[#8A8D91] focus:outline-none focus:bg-white focus:border-[#1877F2] transition-all duration-200',
    error: 'border-[#F02849] focus:border-[#F02849]',
    disabled: 'opacity-50 cursor-not-allowed',
  },

  // Facebook Badges
  badge: {
    blue: 'bg-[#E7F3FF] text-[#1877F2]',
    green: 'bg-[#E5F5E0] text-[#42B72A]',
    red: 'bg-[#FFEBE9] text-[#F02849]',
    yellow: 'bg-[#FFF3CD] text-[#856404]',
    purple: 'bg-[#F3E8FF] text-[#8B5CF6]',
    gray: 'bg-[#E4E6EB] text-[#65676B]',
    base: 'px-2.5 py-1 text-xs font-semibold rounded-full',
  },

  // Facebook Layout
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8 space-y-6',
    grid: {
      cols1: 'grid grid-cols-1 gap-4',
      cols2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
      cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
    },
  },
} as const;

export const clientClasses = {
  page: `min-h-screen ${clientTheme.background.primary} py-8 px-4 lg:px-8`,
  pageHeader: 'mb-8 max-w-3xl',
  pageTitle: `text-3xl md:text-4xl font-bold tracking-tight ${clientTheme.text.primary} leading-tight`,
  pageSubtitle: `${clientTheme.text.secondary} mt-3 text-base font-normal leading-relaxed`,
  
  section: 'py-8 space-y-6',
  sectionTitle: `text-xl md:text-2xl font-bold ${clientTheme.text.primary} tracking-tight`,
  
  card: `${clientTheme.card.base} ${clientTheme.card.padding}`,
  cardHeader: `${clientTheme.card.header}`,
  cardTitle: `text-lg md:text-xl font-bold ${clientTheme.text.primary} tracking-tight`,
  
  list: 'space-y-3',
  listItem: `bg-white p-4 border border-[#E4E6EB] hover:bg-[#F2F3F5] transition-all duration-200 cursor-pointer rounded-lg`,
  
  statCard: `${clientTheme.card.base} p-6 flex flex-col gap-3`,
  statValue: `text-3xl md:text-4xl font-bold ${clientTheme.text.primary} tracking-tight`,
  statLabel: `${clientTheme.text.secondary} text-xs font-semibold uppercase tracking-wide`,
  
  emptyState: 'text-center py-16 px-6 bg-white border border-[#E4E6EB] rounded-lg',
  emptyIcon: `w-12 h-12 text-[#8A8D91] mx-auto mb-4`,
  emptyText: `${clientTheme.text.primary} text-xl font-bold mb-2`,
  emptyDesc: `${clientTheme.text.secondary} text-sm max-w-sm mx-auto font-normal leading-relaxed`,
  
  loading: `flex items-center justify-center min-h-screen bg-[#F0F2F5]`,
  loadingText: `${clientTheme.text.secondary} font-semibold uppercase tracking-wider text-xs`,
  
  error: 'text-center py-12 px-6 bg-[#FFEBE9] border border-[#F02849] rounded-lg',
  errorIcon: 'w-10 h-10 text-[#F02849] mx-auto mb-4',
  errorText: 'text-[#F02849] font-bold text-lg',
} as const;

/**
 * Helper pour combiner les classes Tailwind proprement
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
