/**
 * Auth API Client
 *
 * Client for authentication endpoints.
 */

import { HttpClient } from '../shared/http-client';
import { AuthProvider } from '../constants';
import { AuthUser, AuthSession } from './context';

// ============================================
// TYPES
// ============================================

export interface SignInResponse {
  user: AuthUser;
  session: AuthSession;
}

export interface SignUpResponse {
  user: AuthUser;
  session: AuthSession;
}

export interface SessionResponse {
  session: AuthSession | null;
  user: AuthUser | null;
}

export interface PasswordResetResponse {
  status: boolean;
}

export interface VerificationResponse {
  status: boolean;
}

// ============================================
// API CLIENT
// ============================================

export function createAuthApiClient(httpClient: HttpClient, baseUrl: string) {
  const authPath = '/api/auth';

  /**
   * Sign in with email and password
   */
  async function signIn(email: string, password: string): Promise<SignInResponse> {
    return httpClient.post<SignInResponse>(`${authPath}/sign-in/email`, {
      email,
      password,
    });
  }

  /**
   * Sign up with email and password
   */
  async function signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<SignUpResponse> {
    return httpClient.post<SignUpResponse>(`${authPath}/sign-up/email`, {
      email,
      password,
      name,
    });
  }

  /**
   * Sign out
   */
  async function signOut(): Promise<void> {
    return httpClient.post<void>(`${authPath}/sign-out`);
  }

  /**
   * Get social auth URL
   */
  function getSocialAuthUrl(provider: AuthProvider, redirectUrl?: string): string {
    const params = new URLSearchParams();
    if (redirectUrl) {
      params.set('redirect', redirectUrl);
    }
    const query = params.toString();
    return `${baseUrl}${authPath}/sign-in/${provider}${query ? `?${query}` : ''}`;
  }

  /**
   * Get current session
   */
  async function getSession(): Promise<SessionResponse> {
    return httpClient.get<SessionResponse>(`${authPath}/session`);
  }

  /**
   * Request password reset
   */
  async function forgotPassword(
    email: string,
    redirectTo?: string
  ): Promise<PasswordResetResponse> {
    return httpClient.post<PasswordResetResponse>(`${authPath}/forget-password`, {
      email,
      redirectTo,
    });
  }

  /**
   * Reset password with token
   */
  async function resetPassword(
    token: string,
    newPassword: string
  ): Promise<PasswordResetResponse> {
    return httpClient.post<PasswordResetResponse>(`${authPath}/reset-password`, {
      token,
      newPassword,
    });
  }

  /**
   * Send verification email
   */
  async function sendVerificationEmail(
    email: string,
    redirectTo?: string
  ): Promise<VerificationResponse> {
    return httpClient.post<VerificationResponse>(`${authPath}/send-verification-email`, {
      email,
      redirectTo,
    });
  }

  /**
   * Verify email with token
   */
  async function verifyEmail(token: string): Promise<VerificationResponse> {
    return httpClient.post<VerificationResponse>(`${authPath}/verify-email`, {
      token,
    });
  }

  return {
    signIn,
    signUp,
    signOut,
    getSocialAuthUrl,
    getSession,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
  };
}

export type AuthApiClient = ReturnType<typeof createAuthApiClient>;
