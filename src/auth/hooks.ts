'use client';

/**
 * Auth Hooks
 *
 * React hooks for authentication.
 */

import { useContext, useMemo } from 'react';
import { AuthContext, AuthContextValue, AuthUser, AuthSession } from './context';
import { AuthStatus } from '../constants';

/**
 * Hook to access the full auth context
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

/**
 * Main hook for authentication
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, signIn, signOut } = useAuth();
 *
 * // Check auth state
 * if (isAuthenticated) {
 *   console.log('Welcome', user?.name);
 * }
 *
 * // Sign in
 * await signIn({ email: 'user@example.com', password: 'password' });
 *
 * // Sign out
 * await signOut();
 * ```
 */
export function useAuth() {
  const context = useAuthContext();

  return {
    // Status
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    status: context.status,
    error: context.error,

    // User
    user: context.user,

    // Actions
    signIn: context.signIn,
    signUp: context.signUp,
    signOut: context.signOut,
    signInWithProvider: context.signInWithProvider,
    forgotPassword: context.forgotPassword,
    resetPassword: context.resetPassword,
    sendVerificationEmail: context.sendVerificationEmail,
    verifyEmail: context.verifyEmail,
  };
}

/**
 * Hook to access the current user
 *
 * @example
 * ```tsx
 * const { user, isLoading } = useUser();
 *
 * if (isLoading) return <Loading />;
 * if (!user) return <SignIn />;
 *
 * return <div>Welcome, {user.name}</div>;
 * ```
 */
export function useUser(): {
  user: AuthUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
} {
  const context = useAuthContext();

  return {
    user: context.user,
    isLoading: context.isLoading,
    isSignedIn: context.isAuthenticated,
  };
}

/**
 * Hook to access the current session
 *
 * @example
 * ```tsx
 * const { session, status, refresh } = useSession();
 *
 * if (status === 'loading') return <Loading />;
 * if (status === 'unauthenticated') return <SignIn />;
 *
 * // Manually refresh session
 * await refresh();
 * ```
 */
export function useSession(): {
  session: AuthSession | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
} {
  const context = useAuthContext();

  return {
    session: context.session,
    status: context.status,
    refresh: context.refreshSession,
  };
}

/**
 * Hook to check if user has required permissions
 *
 * @example
 * ```tsx
 * const { isAllowed, isLoading } = useRequireAuth('/login');
 *
 * if (isLoading) return <Loading />;
 * if (!isAllowed) return null; // Will redirect to /login
 *
 * return <ProtectedContent />;
 * ```
 */
export function useRequireAuth(fallbackUrl = '/login'): {
  isAllowed: boolean;
  isLoading: boolean;
} {
  const { isAuthenticated, isLoading } = useAuth();

  const shouldRedirect = useMemo(() => {
    return !isLoading && !isAuthenticated;
  }, [isLoading, isAuthenticated]);

  // Handle redirect
  if (shouldRedirect && typeof window !== 'undefined') {
    window.location.href = fallbackUrl;
  }

  return {
    isAllowed: isAuthenticated,
    isLoading,
  };
}
