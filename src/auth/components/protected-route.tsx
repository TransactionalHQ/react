'use client';

/**
 * ProtectedRoute
 *
 * A component that protects its children based on authentication state.
 */

import React, { useEffect } from 'react';
import { useAuth } from '../hooks';
import { AuthStatus } from '../../constants';

// ============================================
// STYLES
// ============================================

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    fontFamily: 'var(--txl-font-family)',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid var(--txl-muted)',
    borderTopColor: 'var(--txl-primary)',
    borderRadius: '50%',
    animation: 'txl-spin 1s linear infinite',
  },
};

// ============================================
// COMPONENT
// ============================================

export interface ProtectedRouteProps {
  /** Content to render when authenticated */
  children: React.ReactNode;
  /** URL to redirect to when not authenticated */
  fallbackUrl?: string;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom unauthorized component (shown before redirect) */
  unauthorizedComponent?: React.ReactNode;
  /** Callback when redirecting */
  onRedirect?: () => void;
  /** Allow render before auth check completes (for SSR) */
  allowUnverified?: boolean;
}

export function ProtectedRoute({
  children,
  fallbackUrl = '/login',
  loadingComponent,
  unauthorizedComponent,
  onRedirect,
  allowUnverified = false,
}: ProtectedRouteProps): React.ReactElement | null {
  const { isAuthenticated, isLoading, status } = useAuth();

  // Handle redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
      onRedirect?.();

      // Add current URL as redirect param
      const currentUrl = window.location.href;
      const redirectUrl = new URL(fallbackUrl, window.location.origin);
      redirectUrl.searchParams.set('redirect', currentUrl);

      window.location.href = redirectUrl.toString();
    }
  }, [isLoading, isAuthenticated, fallbackUrl, onRedirect]);

  // Loading state
  if (isLoading && !allowUnverified) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
      </div>
    );
  }

  // Unauthorized state (before redirect)
  if (!isAuthenticated && !allowUnverified) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    // Return null while redirecting
    return null;
  }

  // Authenticated - render children
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 *
 * @example
 * ```tsx
 * const ProtectedDashboard = withAuth(Dashboard, {
 *   fallbackUrl: '/login',
 * });
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
