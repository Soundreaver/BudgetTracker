// Color palette
export const colors = {
  // Primary colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  // Secondary colors
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0',
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  // Success colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  // Warning colors
  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  // Error colors
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Dark mode colors
export const darkColors = {
  ...colors,
  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#2C2C2C',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
  },
};

// Light mode colors
export const lightColors = {
  ...colors,
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#EEEEEE',
  },
  text: {
    primary: '#212121',
    secondary: '#616161',
    tertiary: '#9E9E9E',
  },
};

// Typography scale
export const typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heading3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  heading4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.25,
  },
  heading5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  heading6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
};

// Border radius
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadows
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Animation durations
export const durations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Haptic feedback types
export const hapticTypes = {
  light: 'light' as const,
  medium: 'medium' as const,
  heavy: 'heavy' as const,
  success: 'success' as const,
  warning: 'warning' as const,
  error: 'error' as const,
  selection: 'selection' as const,
};
