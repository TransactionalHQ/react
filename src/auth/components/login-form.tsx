'use client';

/**
 * LoginForm
 *
 * Pre-built login form component.
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks';
import { AuthProvider } from '../../constants';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    fontFamily: 'var(--txl-font-family)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--txl-foreground)',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid var(--txl-input)',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-background)',
    color: 'var(--txl-foreground)',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  },
  inputFocus: {
    borderColor: 'var(--txl-ring)',
    boxShadow: '0 0 0 2px rgba(var(--txl-ring), 0.2)',
  },
  button: {
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '16px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--txl-border)',
  },
  dividerText: {
    fontSize: '12px',
    color: 'var(--txl-muted-foreground)',
  },
  socialButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid var(--txl-border)',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-background)',
    color: 'var(--txl-foreground)',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  error: {
    padding: '12px',
    fontSize: '14px',
    color: 'var(--txl-destructive)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 'var(--txl-radius-md)',
    textAlign: 'center' as const,
  },
  link: {
    color: 'var(--txl-primary)',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '16px',
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
    textAlign: 'center' as const,
  },
};

// ============================================
// ICONS
// ============================================

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

// ============================================
// COMPONENT
// ============================================

export interface LoginFormProps {
  /** Title of the form */
  title?: string;
  /** Subtitle of the form */
  subtitle?: string;
  /** Show social login buttons */
  showSocialLogin?: boolean;
  /** Social providers to show */
  socialProviders?: AuthProvider[];
  /** Show forgot password link */
  showForgotPassword?: boolean;
  /** Show sign up link */
  showSignUp?: boolean;
  /** URL for forgot password */
  forgotPasswordUrl?: string;
  /** URL for sign up */
  signUpUrl?: string;
  /** Callback on successful login */
  onSuccess?: () => void;
  /** Callback on forgot password click */
  onForgotPassword?: () => void;
  /** Callback on sign up click */
  onSignUp?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function LoginForm({
  title = 'Welcome back',
  subtitle = 'Sign in to your account',
  showSocialLogin = true,
  socialProviders = [AuthProvider.GOOGLE, AuthProvider.GITHUB],
  showForgotPassword = true,
  showSignUp = true,
  forgotPasswordUrl,
  signUpUrl,
  onSuccess,
  onForgotPassword,
  onSignUp,
  className = '',
  style = {},
}: LoginFormProps): React.ReactElement {
  const { signIn, signInWithProvider, error, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      if (!email || !password) {
        setLocalError('Please enter email and password');
        return;
      }

      try {
        await signIn({ email, password });
        onSuccess?.();
      } catch {
        // Error handled by provider
      }
    },
    [email, password, signIn, onSuccess]
  );

  const handleSocialLogin = useCallback(
    (provider: AuthProvider) => {
      signInWithProvider(provider);
    },
    [signInWithProvider]
  );

  const handleForgotPassword = useCallback(() => {
    if (forgotPasswordUrl && typeof window !== 'undefined') {
      window.location.href = forgotPasswordUrl;
    } else {
      onForgotPassword?.();
    }
  }, [forgotPasswordUrl, onForgotPassword]);

  const handleSignUp = useCallback(() => {
    if (signUpUrl && typeof window !== 'undefined') {
      window.location.href = signUpUrl;
    } else {
      onSignUp?.();
    }
  }, [signUpUrl, onSignUp]);

  const displayError = localError || error;

  return (
    <div style={{ ...styles.container, ...style }} className={`txl-login-form ${className}`}>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.subtitle}>{subtitle}</p>

      {displayError && <div style={styles.error}>{displayError}</div>}

      {showSocialLogin && socialProviders.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {socialProviders.map((provider) => (
              <button
                key={provider}
                type="button"
                style={styles.socialButton}
                onClick={() => handleSocialLogin(provider)}
                disabled={isLoading}
              >
                {provider === AuthProvider.GOOGLE && <GoogleIcon />}
                {provider === AuthProvider.GITHUB && <GitHubIcon />}
                {provider === AuthProvider.MICROSOFT && <MicrosoftIcon />}
                Continue with{' '}
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>
        </>
      )}

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="txl-login-email">
            Email
          </label>
          <input
            id="txl-login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div style={styles.fieldGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={styles.label} htmlFor="txl-login-password">
              Password
            </label>
            {showForgotPassword && (
              <button
                type="button"
                style={{ ...styles.link, border: 'none', background: 'none', padding: 0, fontSize: '14px' }}
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            id="txl-login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={styles.input}
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(isLoading ? styles.buttonDisabled : {}),
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {showSignUp && (
        <div style={styles.footer}>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            style={{ ...styles.link, border: 'none', background: 'none', padding: 0 }}
            onClick={handleSignUp}
          >
            Sign up
          </button>
        </div>
      )}
    </div>
  );
}
