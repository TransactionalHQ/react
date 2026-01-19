'use client';

/**
 * TransactionalAuthProvider
 *
 * Provider component for authentication functionality.
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { AuthStatus, AuthProvider as AuthProviderEnum } from '../constants';
import { useTransactional } from '../provider';
import { clearAuthToken, getAuthToken, storeAuthToken } from '../shared/storage';
import { createAuthApiClient, AuthApiClient } from './api-client';
import {
  AuthContext,
  AuthContextValue,
  AuthState,
  AuthUser,
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
} from './context';

// ============================================
// STATE MANAGEMENT
// ============================================

type AuthAction =
  | { type: 'SET_STATUS'; payload: AuthStatus }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_SESSION'; payload: AuthSession | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTH'; payload: { user: AuthUser; session: AuthSession } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'RESET' };

const initialState: AuthState = {
  status: AuthStatus.LOADING,
  user: null,
  session: null,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AUTH':
      return {
        ...state,
        status: AuthStatus.AUTHENTICATED,
        user: action.payload.user,
        session: action.payload.session,
        error: null,
      };
    case 'CLEAR_AUTH':
      return {
        ...state,
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ============================================
// PROVIDER
// ============================================

export interface TransactionalAuthProviderProps {
  children: React.ReactNode;
  /** Publishable key (optional, for advanced features) */
  publishableKey?: string;
  /** Callback URL after sign in */
  signInCallbackUrl?: string;
  /** Callback URL after sign out */
  signOutCallbackUrl?: string;
  /** Auto-fetch session on mount */
  autoFetch?: boolean;
  /** Callback when sign in succeeds */
  onSignIn?: (user: AuthUser) => void;
  /** Callback when sign out succeeds */
  onSignOut?: () => void;
  /** Callback on auth error */
  onError?: (error: string) => void;
}

export function TransactionalAuthProvider({
  children,
  publishableKey,
  signInCallbackUrl,
  signOutCallbackUrl,
  autoFetch = true,
  onSignIn,
  onSignOut,
  onError,
}: TransactionalAuthProviderProps): React.ReactElement {
  const { config, httpClient } = useTransactional();
  const [state, dispatch] = useReducer(authReducer, initialState);
  const apiClientRef = useRef<AuthApiClient | null>(null);
  const fetchingRef = useRef(false);

  // Create API client
  const apiClient = useMemo(() => {
    const baseUrl = config.baseUrl ?? 'https://api.usetransactional.com';
    apiClientRef.current = createAuthApiClient(httpClient, baseUrl);
    return apiClientRef.current;
  }, [config.baseUrl, httpClient]);

  // Fetch session
  const fetchSession = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const response = await apiClient.getSession();

      if (response.user && response.session) {
        dispatch({
          type: 'SET_AUTH',
          payload: { user: response.user, session: response.session },
        });
      } else {
        dispatch({ type: 'CLEAR_AUTH' });
      }
    } catch {
      dispatch({ type: 'CLEAR_AUTH' });
    } finally {
      fetchingRef.current = false;
    }
  }, [apiClient]);

  // Auto-fetch session on mount
  useEffect(() => {
    if (autoFetch) {
      fetchSession();
    } else {
      dispatch({ type: 'SET_STATUS', payload: AuthStatus.UNAUTHENTICATED });
    }
  }, [autoFetch, fetchSession]);

  // Sign in with email/password
  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      dispatch({ type: 'SET_STATUS', payload: AuthStatus.LOADING });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const response = await apiClient.signIn(
          credentials.email,
          credentials.password
        );

        dispatch({
          type: 'SET_AUTH',
          payload: { user: response.user, session: response.session },
        });

        onSignIn?.(response.user);

        // Redirect if callback URL is set
        if (signInCallbackUrl && typeof window !== 'undefined') {
          window.location.href = signInCallbackUrl;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Sign in failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        dispatch({ type: 'SET_STATUS', payload: AuthStatus.UNAUTHENTICATED });
        onError?.(message);
        throw error;
      }
    },
    [apiClient, onSignIn, onError, signInCallbackUrl]
  );

  // Sign up with email/password
  const signUp = useCallback(
    async (credentials: SignUpCredentials) => {
      dispatch({ type: 'SET_STATUS', payload: AuthStatus.LOADING });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const response = await apiClient.signUp(
          credentials.email,
          credentials.password,
          credentials.name
        );

        dispatch({
          type: 'SET_AUTH',
          payload: { user: response.user, session: response.session },
        });

        onSignIn?.(response.user);

        // Redirect if callback URL is set
        if (signInCallbackUrl && typeof window !== 'undefined') {
          window.location.href = signInCallbackUrl;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Sign up failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        dispatch({ type: 'SET_STATUS', payload: AuthStatus.UNAUTHENTICATED });
        onError?.(message);
        throw error;
      }
    },
    [apiClient, onSignIn, onError, signInCallbackUrl]
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await apiClient.signOut();
    } catch {
      // Ignore sign out errors
    } finally {
      dispatch({ type: 'CLEAR_AUTH' });
      clearAuthToken();
      onSignOut?.();

      // Redirect if callback URL is set
      if (signOutCallbackUrl && typeof window !== 'undefined') {
        window.location.href = signOutCallbackUrl;
      }
    }
  }, [apiClient, onSignOut, signOutCallbackUrl]);

  // Sign in with social provider
  const signInWithProvider = useCallback(
    async (provider: AuthProviderEnum) => {
      if (typeof window === 'undefined') return;

      const url = apiClient.getSocialAuthUrl(provider, signInCallbackUrl);
      window.location.href = url;
    },
    [apiClient, signInCallbackUrl]
  );

  // Forgot password
  const forgotPassword = useCallback(
    async (email: string) => {
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        await apiClient.forgotPassword(email);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to send reset email';
        dispatch({ type: 'SET_ERROR', payload: message });
        onError?.(message);
        throw error;
      }
    },
    [apiClient, onError]
  );

  // Reset password
  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        await apiClient.resetPassword(token, newPassword);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to reset password';
        dispatch({ type: 'SET_ERROR', payload: message });
        onError?.(message);
        throw error;
      }
    },
    [apiClient, onError]
  );

  // Send verification email
  const sendVerificationEmail = useCallback(async () => {
    if (!state.user?.email) {
      throw new Error('No user email available');
    }

    try {
      await apiClient.sendVerificationEmail(state.user.email);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send verification email';
      dispatch({ type: 'SET_ERROR', payload: message });
      onError?.(message);
      throw error;
    }
  }, [apiClient, state.user?.email, onError]);

  // Verify email
  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        await apiClient.verifyEmail(token);

        // Refresh session to get updated user
        await fetchSession();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to verify email';
        dispatch({ type: 'SET_ERROR', payload: message });
        onError?.(message);
        throw error;
      }
    },
    [apiClient, fetchSession, onError]
  );

  // Refresh session
  const refreshSession = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  // Get session (returns current or fetches)
  const getSession = useCallback(async (): Promise<AuthSession | null> => {
    if (state.session) return state.session;
    await fetchSession();
    return state.session;
  }, [state.session, fetchSession]);

  // Context value
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: state.status === AuthStatus.AUTHENTICATED,
      isLoading: state.status === AuthStatus.LOADING,
      signIn,
      signUp,
      signOut,
      signInWithProvider,
      forgotPassword,
      resetPassword,
      sendVerificationEmail,
      verifyEmail,
      refreshSession,
      getSession,
    }),
    [
      state,
      signIn,
      signUp,
      signOut,
      signInWithProvider,
      forgotPassword,
      resetPassword,
      sendVerificationEmail,
      verifyEmail,
      refreshSession,
      getSession,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
