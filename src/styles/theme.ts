/**
 * Theme Configuration
 *
 * CSS variables-based theming system with Vercel/shadcn style defaults.
 */

export interface ThemeColors {
  // Core colors
  primary?: string;
  primaryForeground?: string;
  background?: string;
  foreground?: string;

  // Muted colors
  muted?: string;
  mutedForeground?: string;

  // Borders
  border?: string;

  // Status colors
  destructive?: string;
  destructiveForeground?: string;
  success?: string;
  successForeground?: string;
  warning?: string;
  warningForeground?: string;

  // Accent
  accent?: string;
  accentForeground?: string;

  // Card
  card?: string;
  cardForeground?: string;

  // Input
  input?: string;
  ring?: string;
}

export interface ThemeTypography {
  fontFamily?: string;
  fontFamilyMono?: string;
  fontSize?: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    xl?: string;
  };
}

export interface ThemeBorderRadius {
  sm?: string;
  md?: string;
  lg?: string;
  full?: string;
}

export interface ThemeShadows {
  sm?: string;
  md?: string;
  lg?: string;
}

export interface ThemeConfig {
  colors?: ThemeColors;
  typography?: ThemeTypography;
  borderRadius?: ThemeBorderRadius;
  shadows?: ThemeShadows;
}

/**
 * Default light theme colors (Vercel/shadcn style)
 */
export const defaultLightColors: Required<ThemeColors> = {
  primary: '#18181B',
  primaryForeground: '#FAFAFA',
  background: '#FFFFFF',
  foreground: '#09090B',
  muted: '#F4F4F5',
  mutedForeground: '#71717A',
  border: '#E4E4E7',
  destructive: '#EF4444',
  destructiveForeground: '#FAFAFA',
  success: '#22C55E',
  successForeground: '#FAFAFA',
  warning: '#F59E0B',
  warningForeground: '#FAFAFA',
  accent: '#F4F4F5',
  accentForeground: '#18181B',
  card: '#FFFFFF',
  cardForeground: '#09090B',
  input: '#E4E4E7',
  ring: '#18181B',
};

/**
 * Default dark theme colors (Vercel/shadcn style)
 */
export const defaultDarkColors: Required<ThemeColors> = {
  primary: '#FAFAFA',
  primaryForeground: '#18181B',
  background: '#09090B',
  foreground: '#FAFAFA',
  muted: '#27272A',
  mutedForeground: '#A1A1AA',
  border: '#27272A',
  destructive: '#EF4444',
  destructiveForeground: '#FAFAFA',
  success: '#22C55E',
  successForeground: '#FAFAFA',
  warning: '#F59E0B',
  warningForeground: '#FAFAFA',
  accent: '#27272A',
  accentForeground: '#FAFAFA',
  card: '#09090B',
  cardForeground: '#FAFAFA',
  input: '#27272A',
  ring: '#D4D4D8',
};

/**
 * Default typography
 */
export const defaultTypography: Required<ThemeTypography> = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMono: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Monaco, monospace',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
};

/**
 * Default border radius
 */
export const defaultBorderRadius: Required<ThemeBorderRadius> = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  full: '9999px',
};

/**
 * Default shadows
 */
export const defaultShadows: Required<ThemeShadows> = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

/**
 * Convert camelCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/**
 * Generate CSS variables from theme config
 */
export function generateCssVariables(
  theme: ThemeConfig,
  isDark: boolean
): Record<string, string> {
  const colors = isDark ? defaultDarkColors : defaultLightColors;
  const mergedColors = { ...colors, ...theme.colors };
  const mergedTypography = { ...defaultTypography, ...theme.typography };
  const mergedBorderRadius = { ...defaultBorderRadius, ...theme.borderRadius };
  const mergedShadows = { ...defaultShadows, ...theme.shadows };

  const variables: Record<string, string> = {};

  // Colors
  Object.entries(mergedColors).forEach(([key, value]) => {
    variables[`--txl-${toKebabCase(key)}`] = value;
  });

  // Typography
  variables['--txl-font-family'] = mergedTypography.fontFamily;
  variables['--txl-font-family-mono'] = mergedTypography.fontFamilyMono;
  if (mergedTypography.fontSize) {
    Object.entries(mergedTypography.fontSize).forEach(([key, value]) => {
      variables[`--txl-font-size-${key}`] = value;
    });
  }

  // Border radius
  Object.entries(mergedBorderRadius).forEach(([key, value]) => {
    variables[`--txl-radius-${key}`] = value;
  });

  // Shadows
  Object.entries(mergedShadows).forEach(([key, value]) => {
    variables[`--txl-shadow-${key}`] = value;
  });

  return variables;
}

/**
 * Apply CSS variables to an element
 */
export function applyCssVariables(
  element: HTMLElement,
  variables: Record<string, string>
): void {
  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

/**
 * Create a style string from CSS variables
 */
export function cssVariablesToString(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');
}
