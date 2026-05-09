import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

/**
 * Artisan Theme for Chery Tunisia
 * Handcrafted, warm, and intentional design system.
 */

export const clientTheme = {
  // Artisan Palette
  background: {
    primary: 'bg-[#FDFCFB]',        // Warm Cream
    secondary: 'bg-white',          // Paper White
    tertiary: 'bg-[#F4F1EA]',       // Soft Sand
    hover: 'hover:bg-[#F4F1EA]',    
    dark: 'bg-[#1C1A16]',           // Warm Ink
  },

  // Refined Borders
  border: {
    primary: 'border-[#E8E4DC]',
    secondary: 'border-[#F4F1EA]',
    hover: 'hover:border-[#C16E4F]',
  },

  // Human Typography
  text: {
    primary: 'text-[#1C1A16]',      // Warm Ink
    secondary: 'text-[#5F5C56]',    // Muted Earth
    tertiary: 'text-[#8E8A82]',     
    muted: 'text-[#8E8A82]',        
    accent: 'text-[#C16E4F]',       // Terracotta
  },

  // Handcrafted Buttons
  button: {
    primary: 'bg-[#1C1A16] hover:bg-[#2D2A24] text-[#FDFCFB] font-semibold px-8 py-4 rounded-none transition-all duration-300 active:scale-95 disabled:opacity-50 tracking-widest uppercase text-xs',
    secondary: 'bg-[#C16E4F] hover:bg-[#A95D43] text-white font-semibold px-8 py-4 rounded-none transition-all duration-300 active:scale-95 tracking-widest uppercase text-xs',
    outline: 'border border-[#1C1A16] text-[#1C1A16] hover:bg-[#1C1A16]/5 font-semibold px-8 py-4 rounded-none transition-all duration-300 active:scale-95 tracking-widest uppercase text-xs',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-8 py-4 rounded-none transition-all duration-300 uppercase text-xs tracking-widest',
    success: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-8 py-4 rounded-none transition-all duration-300 uppercase text-xs tracking-widest',
    small: 'px-5 py-2.5 text-[10px]',
    large: 'px-10 py-5 text-sm',
  },

  // Intentional Cards
  card: {
    base: 'bg-white border border-[#E8E4DC] rounded-none shadow-none overflow-hidden',
    hover: 'hover:border-[#C16E4F]/30 hover:shadow-2xl hover:shadow-[#1C1A16]/5 transition-all duration-500',
    padding: 'p-10',
    header: 'border-b border-[#F4F1EA] pb-8 mb-8',
  },

  // Refined Inputs
  input: {
    base: 'w-full px-6 py-4 bg-[#FDFCFB] border border-[#E8E4DC] rounded-none text-[#1C1A16] placeholder-[#8E8A82] focus:outline-none focus:border-[#C16E4F] transition-all duration-300 font-light',
    error: 'border-red-300 focus:border-red-500',
    disabled: 'opacity-50 cursor-not-allowed bg-[#F4F1EA]',
  },

  // Minimal Badges
  badge: {
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border border-rose-100',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-100',
    purple: 'bg-stone-100 text-stone-700 border border-stone-200',
    gray: 'bg-[#F4F1EA] text-[#5F5C56] border border-[#E8E4DC]',
    base: 'px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]',
  },

  // Spacious Layout
  layout: {
    container: 'max-w-7xl mx-auto px-6 lg:px-12',
    section: 'py-24 space-y-12',
    grid: {
      cols1: 'grid grid-cols-1 gap-12',
      cols2: 'grid grid-cols-1 md:grid-cols-2 gap-12',
      cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12',
      cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12',
    },
  },
} as const;

export const clientClasses = {
  page: `min-h-screen ${clientTheme.background.primary} py-20 px-6 lg:px-12`,
  pageHeader: 'mb-16 max-w-3xl',
  pageTitle: `text-4xl md:text-5xl font-serif tracking-tight ${clientTheme.text.primary} leading-tight`,
  pageSubtitle: `${clientTheme.text.secondary} mt-6 text-lg font-light leading-relaxed`,
  
  section: 'py-16 space-y-12',
  sectionTitle: `text-2xl md:text-3xl font-serif ${clientTheme.text.primary} tracking-tight`,
  
  card: `${clientTheme.card.base} ${clientTheme.card.padding}`,
  cardHeader: `${clientTheme.card.header}`,
  cardTitle: `text-xl md:text-2xl font-serif ${clientTheme.text.primary} tracking-tight`,
  
  list: 'space-y-6',
  listItem: `bg-white p-6 border border-[#E8E4DC] hover:border-[#C16E4F]/40 transition-all duration-300 cursor-pointer`,
  
  statCard: `${clientTheme.card.base} p-10 flex flex-col gap-4`,
  statValue: `text-4xl md:text-5xl font-serif ${clientTheme.text.primary} tracking-tight`,
  statLabel: `${clientTheme.text.secondary} text-[10px] font-bold uppercase tracking-[0.3em]`,
  
  emptyState: 'text-center py-24 px-8 bg-[#F4F1EA]/30 border border-[#E8E4DC]',
  emptyIcon: `w-16 h-16 text-[#8E8A82] mx-auto mb-8 stroke-[1px]`,
  emptyText: `${clientTheme.text.primary} text-2xl font-serif mb-4`,
  emptyDesc: `${clientTheme.text.secondary} text-base max-w-sm mx-auto font-light leading-relaxed`,
  
  loading: `flex items-center justify-center min-h-screen bg-[#FDFCFB]`,
  loadingText: `${clientTheme.text.secondary} font-bold uppercase tracking-[0.4em] text-[10px]`,
  
  error: 'text-center py-16 px-8 bg-rose-50/30 border border-rose-100',
  errorIcon: 'w-12 h-12 text-rose-500 mx-auto mb-6 stroke-[1px]',
  errorText: 'text-rose-700 font-serif text-xl',
} as const;

/**
 * Helper pour combiner les classes Tailwind proprement
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
