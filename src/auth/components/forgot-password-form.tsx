'use client';

/**
 * ForgotPasswordForm
 *
 * Form for requesting a password reset.
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks';

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
    lineHeight: '1.5',
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
  error: {
    padding: '12px',
    fontSize: '14px',
    color: 'var(--txl-destructive)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 'var(--txl-radius-md)',
    textAlign: 'center' as const,
  },
  success: {
    padding: '12px',
    fontSize: '14px',
    color: 'var(--txl-success)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
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

function MailIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--txl-primary)', margin: '0 auto 16px' }}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// ============================================
// COMPONENT
// ============================================

export interface ForgotPasswordFormProps {
  /** Title of the form */
  title?: string;
  /** Subtitle of the form */
  subtitle?: string;
  /** Show back to sign in link */
  showBackToSignIn?: boolean;
  /** URL for sign in */
  signInUrl?: string;
  /** Success message */
  successMessage?: string;
  /** Callback on successful request */
  onSuccess?: () => void;
  /** Callback on back to sign in click */
  onBackToSignIn?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function ForgotPasswordForm({
  title = 'Forgot your password?',
  subtitle = "Enter your email and we'll send you a link to reset your password.",
  showBackToSignIn = true,
  signInUrl,
  successMessage = "Check your email for a password reset link. If you don't see it, check your spam folder.",
  onSuccess,
  onBackToSignIn,
  className = '',
  style = {},
}: ForgotPasswordFormProps): React.ReactElement {
  const { forgotPassword, error, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      if (!email) {
        setLocalError('Please enter your email address');
        return;
      }

      try {
        await forgotPassword(email);
        setIsSubmitted(true);
        onSuccess?.();
      } catch {
        // Error handled by provider
      }
    },
    [email, forgotPassword, onSuccess]
  );

  const handleBackToSignIn = useCallback(() => {
    if (signInUrl && typeof window !== 'undefined') {
      window.location.href = signInUrl;
    } else {
      onBackToSignIn?.();
    }
  }, [signInUrl, onBackToSignIn]);

  const displayError = localError || error;

  if (isSubmitted) {
    return (
      <div style={{ ...styles.container, ...style }} className={`txl-forgot-password-form ${className}`}>
        <MailIcon />
        <h2 style={styles.title}>Check your email</h2>
        <p style={styles.subtitle}>{successMessage}</p>

        {showBackToSignIn && (
          <div style={styles.footer}>
            <button
              type="button"
              style={{ ...styles.link, border: 'none', background: 'none', padding: 0 }}
              onClick={handleBackToSignIn}
            >
              Back to sign in
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...style }} className={`txl-forgot-password-form ${className}`}>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.subtitle}>{subtitle}</p>

      {displayError && <div style={styles.error}>{displayError}</div>}

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="txl-forgot-email">
            Email
          </label>
          <input
            id="txl-forgot-email"
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

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(isLoading ? styles.buttonDisabled : {}),
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      {showBackToSignIn && (
        <div style={styles.footer}>
          <button
            type="button"
            style={{ ...styles.link, border: 'none', background: 'none', padding: 0 }}
            onClick={handleBackToSignIn}
          >
            Back to sign in
          </button>
        </div>
      )}
    </div>
  );
}
