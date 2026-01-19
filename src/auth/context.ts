/**
 * Auth Context
 *
 * Context and types for authentication.
 */

import { createContext } from 'react';
import { AuthStatus, AuthProvider } from '../constants';

// ============================================
// TYPES
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  error: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthContextValue extends AuthState {
  // Status helpers
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth actions
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;

  // Social auth
  signInWithProvider: (provider: AuthProvider) => Promise<void>;

  // Password reset
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // Email verification
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;

  // Session management
  refreshSession: () => Promise<void>;
  getSession: () => Promise<AuthSession | null>;
}

// ============================================
// CONTEXT
// ============================================

export const AuthContext = createContext<AuthContextValue | null>(null);
