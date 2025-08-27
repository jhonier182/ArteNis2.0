/**
 * Paleta de colores optimizada para ArteNis 2.0
 * Basada en psicología del color para apps de arte y creatividad
 */

// Colores principales de la marca
export const BrandColors = {
  primary: '#1E3A8A',      // Azul profundo - Confianza y profesionalismo
  secondary: '#D97706',     // Dorado - Creatividad y valor
  accent: '#7C3AED',        // Violeta - Inspiración e imaginación
  success: '#059669',       // Verde esmeralda - Crecimiento y armonía
  warning: '#F59E0B',       // Ámbar - Energía y atención
  error: '#DC2626',         // Rojo - Urgencia y acción
};

// Colores neutros
export const NeutralColors = {
  white: '#FFFFFF',
  black: '#111827',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// Colores de estado
export const StateColors = {
  active: '#1E3A8A',
  inactive: '#9CA3AF',
  hover: '#7C3AED',
  pressed: '#5B21B6',
  disabled: '#D1D5DB',
  loading: '#D97706',
};

// Colores de fondo
export const BackgroundColors = {
  primary: '#FFFFFF',
  secondary: '#F9FAFB',
  tertiary: '#F3F4F6',
  overlay: 'rgba(30, 58, 138, 0.85)',
  card: 'rgba(255, 255, 255, 0.95)',
};

// Colores de texto
export const TextColors = {
  primary: '#111827',
  secondary: '#374151',
  tertiary: '#6B7280',
  inverse: '#FFFFFF',
  placeholder: '#6B7280',
  link: '#7C3AED',
  success: '#059669',
  warning: '#F59E0B',
  error: '#DC2626',
};

// Gradientes
export const Gradients = {
  primary: ['#D97706', '#7C3AED'],
  secondary: ['#1E3A8A', '#059669'],
  success: ['#059669', '#10B981'],
  warning: ['#F59E0B', '#F97316'],
  error: ['#DC2626', '#EF4444'],
};

// Colores para modo oscuro (futuro)
export const DarkColors = {
  primary: '#3B82F6',
  secondary: '#F59E0B',
  accent: '#A855F7',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
};

// Exportación principal para compatibilidad
export const Colors = {
  light: {
    text: TextColors.primary,
    background: BackgroundColors.primary,
    tint: BrandColors.primary,
    icon: TextColors.tertiary,
    tabIconDefault: TextColors.tertiary,
    tabIconSelected: BrandColors.primary,
  },
  dark: {
    text: DarkColors.text,
    background: DarkColors.background,
    tint: DarkColors.primary,
    icon: TextColors.tertiary,
    tabIconDefault: TextColors.tertiary,
    tabIconSelected: DarkColors.primary,
  },
};

// Exportación de todos los colores
export default {
  BrandColors,
  NeutralColors,
  StateColors,
  BackgroundColors,
  TextColors,
  Gradients,
  DarkColors,
  Colors,
};
