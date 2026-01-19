'use client';

/**
 * TransactionalProvider
 *
 * Root provider for the Transactional React SDK.
 * Provides configuration context and initializes theming.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Theme } from './constants';
import { createHttpClient, HttpClient } from './shared/http-client';
import { ThemeConfig } from './styles/theme';
import { injectCssVariables, injectBaseCss, removeCssVariables, removeBaseCss } from './styles/css-variables';

// ============================================
// TYPES
// ============================================

export interface AuthConfig {
  /** Publishable key for auth */
  publishableKey?: string;
  /** Enable social login providers */
  socialProviders?: ('google' | 'github' | 'microsoft')[];
  /** Redirect URL after login */
  redirectUrl?: string;
}

export interface ChatConfig {
  /** Inbox ID for the chat widget */
  inboxId?: string;
  /** Default widget state on load */
  defaultState?: 'open' | 'closed';
}

export interface KBConfig {
  /** Organization slug for knowledge base */
  orgSlug?: string;
}

export interface FormsConfig {
  /** Default success message */
  successMessage?: string;
}

export interface TransactionalConfig {
  /** Base URL for the API */
  baseUrl?: string;
  /** Organization slug */
  orgSlug?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
  /** Theme mode */
  themeMode?: Theme;
  /** Auth module configuration */
  auth?: AuthConfig;
  /** Chat module configuration */
  chat?: ChatConfig;
  /** Knowledge Base module configuration */
  kb?: KBConfig;
  /** Forms module configuration */
  forms?: FormsConfig;
}

export interface TransactionalContextValue {
  config: TransactionalConfig;
  httpClient: HttpClient;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

// ============================================
// CONTEXT
// ============================================

const TransactionalContext = createContext<TransactionalContextValue | null>(null);

// ============================================
// HOOKS
// ============================================

/**
 * Hook to access Transactional context
 */
export function useTransactional(): TransactionalContextValue {
  const context = useContext(TransactionalContext);
  if (!context) {
    throw new Error('useTransactional must be used within a TransactionalProvider');
  }
  return context;
}

/**
 * Hook to access the HTTP client
 */
export function useHttpClient(): HttpClient {
  const { httpClient } = useTransactional();
  return httpClient;
}

/**
 * Hook to access theme utilities
 */
export function useTheme() {
  const { theme, setTheme, isDark } = useTransactional();
  return { theme, setTheme, isDark };
}

// ============================================
// UTILITIES
// ============================================

/**
 * Detect system color scheme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get effective theme (resolve 'system' to actual theme)
 */
function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === Theme.SYSTEM) {
    return getSystemTheme();
  }
  return theme;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export interface TransactionalProviderProps {
  children: React.ReactNode;
  config: TransactionalConfig;
}

export function TransactionalProvider({
  children,
  config,
}: TransactionalProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState<Theme>(config.themeMode ?? Theme.SYSTEM);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Create HTTP client
  const httpClient = useMemo(() => {
    const baseUrl = config.baseUrl ?? 'https://api.usetransactional.com';
    return createHttpClient({ baseUrl });
  }, [config.baseUrl]);

  // Handle theme changes
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const effective = getEffectiveTheme(theme);
    setEffectiveTheme(effective);

    // Inject CSS
    injectBaseCss();
    injectCssVariables(config.theme ?? {}, effective === 'dark');

    // Listen for system theme changes
    if (theme === Theme.SYSTEM && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        const newEffective = e.matches ? 'dark' : 'light';
        setEffectiveTheme(newEffective);
        injectCssVariables(config.theme ?? {}, newEffective === 'dark');
      };

      mediaQuery.addEventListener('change', handler);
      return () => {
        mediaQuery.removeEventListener('change', handler);
      };
    }
  }, [theme, config.theme]);

  // Update CSS when theme changes
  useEffect(() => {
    const effective = getEffectiveTheme(theme);
    injectCssVariables(config.theme ?? {}, effective === 'dark');
  }, [theme, config.theme]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeCssVariables();
      removeBaseCss();
    };
  }, []);

  const contextValue = useMemo<TransactionalContextValue>(
    () => ({
      config,
      httpClient,
      theme,
      setTheme,
      isDark: effectiveTheme === 'dark',
    }),
    [config, httpClient, theme, effectiveTheme]
  );

  return (
    <TransactionalContext.Provider value={contextValue}>
      <div className={`txl-root ${effectiveTheme === 'dark' ? 'txl-dark' : ''}`}>
        {children}
      </div>
    </TransactionalContext.Provider>
  );
}

export { TransactionalContext };
