'use client';

/**
 * SignupForm
 *
 * Pre-built signup form component.
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
    transition: 'border-color 150ms ease',
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
  terms: {
    marginTop: '12px',
    fontSize: '12px',
    color: 'var(--txl-muted-foreground)',
    textAlign: 'center' as const,
    lineHeight: '1.5',
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

// ============================================
// COMPONENT
// ============================================

export interface SignupFormProps {
  /** Title of the form */
  title?: string;
  /** Subtitle of the form */
  subtitle?: string;
  /** Required fields */
  requiredFields?: ('name' | 'email' | 'password')[];
  /** Show social signup buttons */
  showSocialLogin?: boolean;
  /** Social providers to show */
  socialProviders?: AuthProvider[];
  /** Show sign in link */
  showSignIn?: boolean;
  /** URL for sign in */
  signInUrl?: string;
  /** Show terms and privacy links */
  showTerms?: boolean;
  /** Terms of service URL */
  termsUrl?: string;
  /** Privacy policy URL */
  privacyUrl?: string;
  /** Callback on successful signup */
  onSuccess?: () => void;
  /** Callback on sign in click */
  onSignIn?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function SignupForm({
  title = 'Create an account',
  subtitle = 'Get started in minutes',
  requiredFields = ['email', 'password'],
  showSocialLogin = true,
  socialProviders = [AuthProvider.GOOGLE, AuthProvider.GITHUB],
  showSignIn = true,
  signInUrl,
  showTerms = true,
  termsUrl,
  privacyUrl,
  onSuccess,
  onSignIn,
  className = '',
  style = {},
}: SignupFormProps): React.ReactElement {
  const { signUp, signInWithProvider, error, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const showNameField = requiredFields.includes('name');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      if (!email || !password) {
        setLocalError('Please fill in all required fields');
        return;
      }

      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters');
        return;
      }

      try {
        await signUp({ email, password, name: showNameField ? name : undefined });
        onSuccess?.();
      } catch {
        // Error handled by provider
      }
    },
    [email, password, name, showNameField, signUp, onSuccess]
  );

  const handleSocialLogin = useCallback(
    (provider: AuthProvider) => {
      signInWithProvider(provider);
    },
    [signInWithProvider]
  );

  const handleSignIn = useCallback(() => {
    if (signInUrl && typeof window !== 'undefined') {
      window.location.href = signInUrl;
    } else {
      onSignIn?.();
    }
  }, [signInUrl, onSignIn]);

  const displayError = localError || error;

  return (
    <div style={{ ...styles.container, ...style }} className={`txl-signup-form ${className}`}>
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
        {showNameField && (
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="txl-signup-name">
              Full name
            </label>
            <input
              id="txl-signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={styles.input}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="txl-signup-email">
            Email
          </label>
          <input
            id="txl-signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
            disabled={isLoading}
            autoComplete="email"
            required
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="txl-signup-password">
            Password
          </label>
          <input
            id="txl-signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={styles.input}
            disabled={isLoading}
            autoComplete="new-password"
            required
            minLength={8}
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {showTerms && (
        <p style={styles.terms}>
          By signing up, you agree to our{' '}
          {termsUrl ? (
            <a href={termsUrl} style={styles.link} target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
          ) : (
            'Terms of Service'
          )}{' '}
          and{' '}
          {privacyUrl ? (
            <a href={privacyUrl} style={styles.link} target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          ) : (
            'Privacy Policy'
          )}
        </p>
      )}

      {showSignIn && (
        <div style={styles.footer}>
          Already have an account?{' '}
          <button
            type="button"
            style={{ ...styles.link, border: 'none', background: 'none', padding: 0 }}
            onClick={handleSignIn}
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
}
