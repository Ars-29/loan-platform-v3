/**
 * Centralized Theme Configuration
 * Following the design system requirements from plan.md
 * 
 * This file contains all theme-related constants and configurations
 * to ensure consistency across the entire application.
 */

// Color Palette
export const colors = {
  // Primary Colors - Gradient Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main blue
    600: '#2563eb', // Primary blue
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Dark Blue
  darkBlue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Dark Purple
  darkPurple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Neutral Colors
  gray: {
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
  
  // Status Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Additional color palettes for UI components
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Text colors - Context-aware contrast system
  text: {
    // Default text colors for white/light backgrounds
    primary: '#000000', // Black text for white backgrounds
    secondary: '#374151', // Dark gray for secondary text on white backgrounds
    muted: '#6b7280', // Medium gray for muted text on white backgrounds
    light: '#9ca3af', // Light gray for subtle text on white backgrounds
    
    // Text colors for colored/dark backgrounds
    onPrimary: '#ffffff', // White text for primary colored backgrounds
    onSecondary: '#ffffff', // White text for secondary colored backgrounds
    onDark: '#ffffff', // White text for dark backgrounds
    onColored: '#ffffff', // White text for any colored background
    
    // Legacy white reference for backward compatibility
    white: '#ffffff', // Pure white for dark backgrounds only
  },
  
  // Background colors
  background: '#f9fafb', // gray[50]
  white: '#ffffff',
} as const;

// Typography System
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Typography Classes for consistent styling - Context-aware contrast
  headings: {
    // Default headings for white/light backgrounds
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight',
    h3: 'text-2xl md:text-3xl lg:text-4xl font-bold text-black leading-tight',
    h4: 'text-xl md:text-2xl lg:text-3xl font-bold text-black leading-tight',
    h5: 'text-lg md:text-xl lg:text-2xl font-bold text-black leading-tight',
    h6: 'text-base md:text-lg lg:text-xl font-bold text-black leading-tight',
    
    // Headings for colored/dark backgrounds
    h1OnColored: 'text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight',
    h2OnColored: 'text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight',
    h3OnColored: 'text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight',
    h4OnColored: 'text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight',
    h5OnColored: 'text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight',
    h6OnColored: 'text-base md:text-lg lg:text-xl font-bold text-white leading-tight',
  },
  
  body: {
    // Default body text for white/light backgrounds
    large: 'text-lg md:text-xl text-gray-900 leading-relaxed',
    base: 'text-base md:text-lg text-gray-900 leading-relaxed',
    small: 'text-sm md:text-base text-gray-900 leading-relaxed',
    xs: 'text-xs md:text-sm text-gray-900 leading-relaxed',
    
    // Body text for colored/dark backgrounds
    largeOnColored: 'text-lg md:text-xl text-white leading-relaxed',
    baseOnColored: 'text-base md:text-lg text-white leading-relaxed',
    smallOnColored: 'text-sm md:text-base text-white leading-relaxed',
    xsOnColored: 'text-xs md:text-sm text-white leading-relaxed',
  },
  
  // Responsive text utilities - Context-aware contrast
  responsive: {
    // Default responsive text for white/light backgrounds
    hero: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight',
    title: 'text-2xl sm:text-3xl md:text-4xl font-bold text-black leading-tight',
    subtitle: 'text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed',
    body: 'text-sm sm:text-base md:text-lg text-gray-900 leading-relaxed',
    caption: 'text-xs sm:text-sm text-gray-700 leading-normal',
    
    // Responsive text for colored/dark backgrounds
    heroOnColored: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight',
    titleOnColored: 'text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight',
    subtitleOnColored: 'text-lg sm:text-xl md:text-2xl font-semibold text-white leading-relaxed',
    bodyOnColored: 'text-sm sm:text-base md:text-lg text-white leading-relaxed',
    captionOnColored: 'text-xs sm:text-sm text-gray-200 leading-normal',
  },
  
  // Additional typography properties for components - Mac optimized
  h1: {
    fontSize: '1.5rem', // fontSize['2xl']
    fontWeight: '700', // fontWeight.bold
    color: colors.text.primary,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  },
  h2: {
    fontSize: '1.25rem', // fontSize.xl
    fontWeight: '600', // fontWeight.semibold
    color: colors.text.primary,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  },
  sm: {
    fontSize: '0.875rem', // fontSize.sm
    fontWeight: '500', // fontWeight.medium
    color: colors.text.secondary,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  },
  xs: {
    fontSize: '0.75rem', // fontSize.xs
    fontWeight: '400', // fontWeight.normal
    color: colors.text.muted,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  },
  lg: {
    fontSize: '1.125rem', // fontSize.lg
    fontWeight: '500', // fontWeight.medium
    color: colors.text.primary,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  },
} as const;

// Spacing Scale
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  // Additional spacing values
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  xl2: '2.5rem',  // 40px
  container: '1.5rem', // 24px
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// Component-specific theme tokens
export const components = {
  button: {
    height: {
      sm: '2rem',     // 32px
      md: '2.5rem',   // 40px
      lg: '3rem',     // 48px
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.625rem 1.25rem',
      lg: '0.75rem 1.5rem',
    },
  },
  
  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.625rem 1rem',
      lg: '0.75rem 1.25rem',
    },
  },
  
  card: {
    padding: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
    borderRadius: '0.5rem',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  
  table: {
    headerHeight: '3rem',
    rowHeight: '4rem',
    cellPadding: '1rem 1.5rem',
  },
} as const;

// Role-based text configurations
export const roleTexts = {
  super_admin: {
    createButton: 'Create Company',
    entityName: 'Company',
    entityNamePlural: 'Companies',
    createFormTitle: 'Create New Company',
    emptyStateMessage: 'No companies found. Create your first company above.',
    actions: {
      resend: 'Resend Invite',
      deactivate: 'Deactivate Company',
      reactivate: 'Reactivate Company',
      delete: 'Delete Company',
    },
  },
  company_admin: {
    createButton: 'Add Officer',
    entityName: 'Officer',
    entityNamePlural: 'Loan Officers',
    createFormTitle: 'Add New Loan Officer',
    emptyStateMessage: 'No loan officers found. Create your first officer above.',
    actions: {
      resend: 'Resend Invite',
      deactivate: 'Deactivate Officer',
      reactivate: 'Reactivate Officer',
      delete: 'Delete Officer',
    },
  },
  employee: {
    createButton: 'Add Lead',
    entityName: 'Lead',
    entityNamePlural: 'Leads',
    createFormTitle: 'Add New Lead',
    emptyStateMessage: 'No leads found. Create your first lead above.',
    actions: {
      resend: 'Resend Invite',
      deactivate: 'Deactivate Lead',
      reactivate: 'Reactivate Lead',
      delete: 'Delete Lead',
    },
  },
} as const;

// Animation durations
export const animations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Dashboard Layout Styles
export const dashboard = {
  // Layout containers
  container: {
    minHeight: '100vh',
    backgroundColor: colors.gray[50],
  },
  mainContent: {
    maxWidth: '1280px', // max-w-7xl
    margin: '0 auto',
    padding: `${spacing[6]} ${spacing[6]}`,
  },
  
  // Additional dashboard properties
  layout: {
    maxWidth: '1280px',
  },
  colors: {
    background: colors.gray[50],
    white: colors.white,
    primary: colors.primary,
    blue: colors.blue,
    green: colors.green,
    text: colors.text,
  },
  spacing: spacing,
  typography: typography,
  borderRadius: borderRadius,
  shadows: shadows,
  
  // Header styles
  header: {
    backgroundColor: '#ffffff',
    boxShadow: shadows.sm,
    borderBottom: `1px solid ${colors.gray[200]}`,
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: `0 ${spacing[4]}`,
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px', // h-16
  },
  
  // Navigation styles
  nav: {
    backgroundColor: '#ffffff',
    boxShadow: shadows.sm,
    borderBottom: `1px solid ${colors.gray[200]}`,
  },
  navContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: `0 ${spacing[4]}`,
  },
  navInner: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '64px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[8],
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spacing[1]} ${spacing[1]}`,
    borderBottom: '2px solid transparent',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[500],
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
  },
  navLinkActive: {
    borderBottomColor: colors.primary[500],
    color: colors.gray[900],
  },
  navLinkHover: {
    borderBottomColor: colors.gray[300],
    color: colors.gray[700],
  },
  
  // Card styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.gray[200]}`,
    padding: spacing[6],
  },
  cardHover: {
    boxShadow: shadows.md,
    transition: 'box-shadow 0.2s ease-in-out',
  },
  
  // Stats card styles
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.gray[200]}`,
    padding: spacing[5],
    overflow: 'hidden',
  },
  statsCardIcon: {
    width: '32px',
    height: '32px',
    borderRadius: borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statsCardContent: {
    marginLeft: spacing[5],
    flex: 1,
    minWidth: 0,
  },
  statsCardLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[500],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statsCardValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  
  // Quick action styles
  quickActionCard: {
    backgroundColor: '#ffffff',
    padding: spacing[6],
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
    border: 'none',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease-in-out',
  },
  quickActionCardHover: {
    boxShadow: shadows.md,
  },
  quickActionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  quickActionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    marginBottom: spacing[1],
  },
  quickActionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  
  // Button styles
  button: {
    primary: {
      backgroundColor: colors.primary[600],
      color: '#ffffff',
      padding: `${spacing[2]} ${spacing[4]}`,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease-in-out',
    },
    primaryHover: {
      backgroundColor: colors.primary[700],
    },
    secondary: {
      backgroundColor: '#ffffff',
      color: colors.gray[700],
      padding: `${spacing[2]} ${spacing[4]}`,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: `1px solid ${colors.gray[300]}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    },
    secondaryHover: {
      backgroundColor: colors.gray[50],
      borderColor: colors.gray[400],
    },
  },
  
  // User info styles
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    backgroundColor: colors.primary[100],
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
  },
  userDetails: {
    textAlign: 'right',
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  userRole: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  
  // Grid layouts
  grid: {
    cols1: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: spacing[6],
    },
    cols2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: spacing[6],
    },
    cols3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: spacing[6],
    },
    cols4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: spacing[4],
    },
    cols5: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: spacing[4],
    },
  },
  
  // Responsive breakpoints for grid
  responsive: {
    sm: {
      gridTemplateColumns: '1fr',
    },
    md: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    lg: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
} as const;

// Import Lucide React icons
import {
  Home,
  Info,
  Phone,
  Menu,
  X,
  FileText,
  Target,
  TrendingUp,
  Calculator,
  User,
  ArrowRight,
  MessageCircle,
  RefreshCw,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Search,
  Star,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Asterisk,
  Building2,
  RefreshCw as Refresh,
  ArrowUp,
  Calendar,
  Shield,
  Clock,
  type LucideIcon
} from 'lucide-react';

// Icon Configuration using Lucide React
// Icons were moved to components/ui/Icon.tsx to centralize UI primitives.
// Import icons from '@/components/ui/Icon' where needed.

// Import efficient templates hook
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';

// Fallback templates for when database is unavailable
const fallbackTemplates = {
  template1: {
    colors: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      background: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    content: {
      headline: 'Find the best loan for you',
      subheadline: 'Compare today\'s rates and apply directly with our loan officers',
      ctaText: 'Get rates',
      ctaSecondary: 'Learn more',
      companyName: 'LoanPro',
      tagline: 'Real-time demo',
    },
    layout: {
      alignment: 'center',
      spacing: 18,
      borderRadius: 8,
      padding: {
        small: 8,
        medium: 16,
        large: 24,
        xlarge: 32,
      },
    },
    advanced: {
      customCSS: '',
      accessibility: true,
    },
    classes: {
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300',
        outline: 'border-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-all duration-200',
        ghost: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200',
      },
      card: {
        container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
        header: 'px-6 py-4 border-b border-gray-200',
        body: 'px-6 py-4',
        footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50',
      },
      heading: {
        h1: 'text-3xl font-bold text-gray-900 mb-4',
        h2: 'text-2xl font-bold text-gray-900 mb-3',
        h3: 'text-xl font-semibold text-gray-900 mb-2',
        h4: 'text-lg font-semibold text-gray-900 mb-2',
        h5: 'text-base font-semibold text-gray-900 mb-2',
        h6: 'text-sm font-semibold text-gray-900 mb-1',
      },
      body: {
        large: 'text-lg text-gray-700 leading-relaxed',
        base: 'text-base text-gray-700 leading-relaxed',
        small: 'text-sm text-gray-600 leading-relaxed',
        xs: 'text-xs text-gray-500 leading-normal',
      },
      input: {
        base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200',
        error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
        success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      },
      select: {
        base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white',
      },
      status: {
        success: 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium',
        warning: 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium',
        error: 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium',
        info: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium',
      },
      icon: {
        primary: 'w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4',
        secondary: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3',
        small: 'w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center',
      },
      navigation: {
        container: 'flex flex-wrap gap-2 p-4',
        tab: {
          base: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer',
          inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
          active: 'bg-blue-600 text-white shadow-md',
          hover: 'hover:bg-blue-50 hover:text-blue-700',
        },
      },
      hero: {
        background: 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900',
        overlay: 'bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-indigo-900/90',
      },
      sidebar: {
        container: 'bg-white border-2 border-blue-200 rounded-lg p-6',
        logo: {
          background: 'bg-blue-600',
          text: 'text-white',
        },
      },
    },
  },
  template2: {
    colors: {
      primary: '#9333ea',
      secondary: '#dc2626',
      background: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    content: {
      headline: 'Find the best loan for you',
      subheadline: 'Compare today\'s rates and apply directly with our loan officers',
      ctaText: 'Get rates',
      ctaSecondary: 'Learn more',
      companyName: 'LoanPro',
      tagline: 'Real-time demo',
    },
    layout: {
      alignment: 'center',
      spacing: 18,
      borderRadius: 8,
      padding: {
        small: 8,
        medium: 16,
        large: 24,
        xlarge: 32,
      },
    },
    advanced: {
      customCSS: '',
      accessibility: true,
    },
    classes: {
      button: {
        primary: 'bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300',
        outline: 'border-2 border-purple-200 hover:border-purple-300 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-all duration-200',
        ghost: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-all duration-200',
      },
      card: {
        container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
        header: 'px-6 py-4 border-b border-gray-200',
        body: 'px-6 py-4',
        footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50',
      },
      heading: {
        h1: 'text-3xl font-bold text-gray-900 mb-4',
        h2: 'text-2xl font-bold text-gray-900 mb-3',
        h3: 'text-xl font-semibold text-gray-900 mb-2',
        h4: 'text-lg font-semibold text-gray-900 mb-2',
        h5: 'text-base font-semibold text-gray-900 mb-2',
        h6: 'text-sm font-semibold text-gray-900 mb-1',
      },
      body: {
        large: 'text-lg text-gray-700 leading-relaxed',
        base: 'text-base text-gray-700 leading-relaxed',
        small: 'text-sm text-gray-600 leading-relaxed',
        xs: 'text-xs text-gray-500 leading-normal',
      },
      input: {
        base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200',
        error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
        success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      },
      select: {
        base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white',
      },
      status: {
        success: 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium',
        warning: 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium',
        error: 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium',
        info: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium',
      },
      icon: {
        primary: 'w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4',
        secondary: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3',
        small: 'w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center',
      },
      navigation: {
        container: 'flex flex-wrap gap-2 p-4',
        tab: {
          base: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer',
          inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
          active: 'bg-purple-600 text-white shadow-md',
          hover: 'hover:bg-purple-50 hover:text-purple-700',
        },
      },
      hero: {
        background: 'bg-gradient-to-br from-red-900 via-red-800 to-red-900',
        overlay: 'bg-gradient-to-br from-red-900/90 via-red-800/90 to-red-900/90',
      },
      sidebar: {
        container: 'bg-white border-2 border-purple-200 rounded-lg p-6',
        logo: {
          background: 'bg-purple-600',
          text: 'text-white',
        },
      },
    },
  },
};

// Template type definition
export interface Template {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  content: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaSecondary: string;
    companyName: string;
    tagline: string;
  };
  layout: {
    alignment: string;
    spacing: number;
    borderRadius: number;
    padding: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
  };
  advanced: {
    customCSS: string;
    accessibility: boolean;
  };
  classes: {
    button: {
      primary: string;
      secondary: string;
      outline: string;
      ghost: string;
    };
    card: {
      container: string;
      header: string;
      body: string;
      footer: string;
    };
    heading: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
    };
    body: {
      large: string;
      base: string;
      small: string;
      xs: string;
    };
    input: {
      base: string;
      error: string;
      success: string;
    };
    select: {
      base: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    icon: {
      primary: string;
      secondary: string;
      small: string;
    };
    navigation: {
      container: string;
      tab: {
        base: string;
        inactive: string;
        active: string;
        hover: string;
      };
    };
    hero: {
      background: string;
      overlay: string;
    };
    sidebar: {
      container: string;
      logo: {
        background: string;
        text: string;
      };
    };
  };
}

// Export template utilities
export {
  useEfficientTemplates,
  fallbackTemplates
};

// DEPRECATED: Hardcoded templates removed - Use database templates via useEfficientTemplates()
// All template data now comes from the database

export const getTextClasses = (backgroundType: 'white' | 'light' | 'colored' | 'dark' = 'white') => {
  switch (backgroundType) {
    case 'white':
    case 'light':
      return {
        heading: {
          h1: typography.headings.h1,
          h2: typography.headings.h2,
          h3: typography.headings.h3,
          h4: typography.headings.h4,
          h5: typography.headings.h5,
          h6: typography.headings.h6,
        },
        body: {
          large: typography.body.large,
          base: typography.body.base,
          small: typography.body.small,
          xs: typography.body.xs,
        },
        responsive: {
          hero: typography.responsive.hero,
          title: typography.responsive.title,
          subtitle: typography.responsive.subtitle,
          body: typography.responsive.body,
          caption: typography.responsive.caption,
        },
      };
    case 'colored':
    case 'dark':
      return {
        heading: {
          h1: typography.headings.h1OnColored,
          h2: typography.headings.h2OnColored,
          h3: typography.headings.h3OnColored,
          h4: typography.headings.h4OnColored,
          h5: typography.headings.h5OnColored,
          h6: typography.headings.h6OnColored,
        },
        body: {
          large: typography.body.largeOnColored,
          base: typography.body.baseOnColored,
          small: typography.body.smallOnColored,
          xs: typography.body.xsOnColored,
        },
        responsive: {
          hero: typography.responsive.heroOnColored,
          title: typography.responsive.titleOnColored,
          subtitle: typography.responsive.subtitleOnColored,
          body: typography.responsive.bodyOnColored,
          caption: typography.responsive.captionOnColored,
        },
      };
    default:
      return {
        heading: {
          h1: typography.headings.h1,
          h2: typography.headings.h2,
          h3: typography.headings.h3,
          h4: typography.headings.h4,
          h5: typography.headings.h5,
          h6: typography.headings.h6,
        },
        body: {
          large: typography.body.large,
          base: typography.body.base,
          small: typography.body.small,
          xs: typography.body.xs,
        },
        responsive: {
          hero: typography.responsive.hero,
          title: typography.responsive.title,
          subtitle: typography.responsive.subtitle,
          body: typography.responsive.body,
          caption: typography.responsive.caption,
        },
      };
  }
};

// Template utility functions for backward compatibility
// These functions provide access to template data from the template manager

export const getTemplateColors = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.colors || fallbackTemplates.template1.colors;
};

export const getTemplateTypography = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.typography || fallbackTemplates.template1.typography;
};

export const getTemplateContent = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.content || fallbackTemplates.template1.content;
};

export const getTemplateLayout = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.layout || fallbackTemplates.template1.layout;
};

export const getTemplateAdvanced = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.advanced || fallbackTemplates.template1.advanced;
};

export const getTemplateStyles = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.classes || fallbackTemplates.template1.classes;
};

export const getTemplateButtonStyles = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.classes?.button || fallbackTemplates.template1.classes.button;
};

export const getTemplateNavigationStyles = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.classes?.navigation || fallbackTemplates.template1.classes.navigation;
};

export const getTemplateHeroStyles = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.classes?.hero || fallbackTemplates.template1.classes.hero;
};

export const getTemplateSidebarStyles = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.classes?.sidebar || fallbackTemplates.template1.classes.sidebar;
};

export const getTemplateTabStyles = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  return template?.classes?.navigation?.tab || fallbackTemplates.template1.classes.navigation.tab;
};

export const getUnifiedTabStyles = (templateId: 'template1' | 'template2' = 'template1') => {
  const template = fallbackTemplates[templateId];
  const fallbackTemplate = fallbackTemplates.template1;
  
  return {
    container: template?.classes?.navigation?.container || fallbackTemplate.classes.navigation.container,
    tab: {
      base: template?.classes?.navigation?.tab?.base || fallbackTemplate.classes.navigation.tab.base,
      inactive: template?.classes?.navigation?.tab?.inactive || fallbackTemplate.classes.navigation.tab.inactive,
      active: template?.classes?.navigation?.tab?.active || fallbackTemplate.classes.navigation.tab.active,
      hover: template?.classes?.navigation?.tab?.hover || fallbackTemplate.classes.navigation.tab.hover,
    },
    colors: template?.colors || fallbackTemplate.colors,
    // Include all template classes for backward compatibility
    ...template?.classes || fallbackTemplate.classes,
  };
};

export const getTextColor = (backgroundType: 'white' | 'light' | 'colored' | 'dark' = 'white') => {
  switch (backgroundType) {
    case 'white':
    case 'light':
      return colors.text.primary;
    case 'colored':
    case 'dark':
      return colors.text.onColored;
    default:
      return colors.text.primary;
  }
};

// Export default theme object
export const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  borderRadius,
  shadows,
  components,
  roleTexts,
  animations,
  zIndex,
  dashboard,
  templates: fallbackTemplates,
  getTextColor,
  getTextClasses,
  getTemplateStyles,
  getTemplateColors,
  getTemplateTypography,
  getTemplateContent,
  getTemplateLayout,
  getTemplateAdvanced,
  getTemplateButtonStyles,
  getTemplateNavigationStyles,
  getTemplateHeroStyles,
  getTemplateSidebarStyles,
  getTemplateTabStyles,
  getUnifiedTabStyles,
} as const;

export type Theme = typeof theme;
export type ColorPalette = keyof typeof colors;
export type RoleType = keyof typeof roleTexts;
