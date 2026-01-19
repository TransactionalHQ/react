'use client';

/**
 * ResetPasswordForm
 *
 * Form for setting a new password with a reset token.
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
    padding: '16px',
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
  hint: {
    fontSize: '12px',
    color: 'var(--txl-muted-foreground)',
    marginTop: '4px',
  },
};

// ============================================
// ICONS
// ============================================

function CheckIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--txl-success)', margin: '0 auto 16px' }}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ============================================
// COMPONENT
// ============================================

export interface ResetPasswordFormProps {
  /** Reset token from URL */
  token: string;
  /** Title of the form */
  title?: string;
  /** Subtitle of the form */
  subtitle?: string;
  /** Minimum password length */
  minPasswordLength?: number;
  /** Success message */
  successMessage?: string;
  /** URL for sign in after success */
  signInUrl?: string;
  /** Callback on successful reset */
  onSuccess?: () => void;
  /** Callback on sign in click */
  onSignIn?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function ResetPasswordForm({
  token,
  title = 'Reset your password',
  subtitle = 'Enter a new password for your account.',
  minPasswordLength = 8,
  successMessage = 'Your password has been reset successfully. You can now sign in with your new password.',
  signInUrl,
  onSuccess,
  onSignIn,
  className = '',
  style = {},
}: ResetPasswordFormProps): React.ReactElement {
  const { resetPassword, error, isLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      if (!password) {
        setLocalError('Please enter a new password');
        return;
      }

      if (password.length < minPasswordLength) {
        setLocalError(`Password must be at least ${minPasswordLength} characters`);
        return;
      }

      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }

      try {
        await resetPassword(token, password);
        setIsSuccess(true);
        onSuccess?.();
      } catch {
        // Error handled by provider
      }
    },
    [password, confirmPassword, minPasswordLength, token, resetPassword, onSuccess]
  );

  const handleSignIn = useCallback(() => {
    if (signInUrl && typeof window !== 'undefined') {
      window.location.href = signInUrl;
    } else {
      onSignIn?.();
    }
  }, [signInUrl, onSignIn]);

  const displayError = localError || error;

  if (isSuccess) {
    return (
      <div style={{ ...styles.container, ...style }} className={`txl-reset-password-form ${className}`}>
        <CheckIcon />
        <h2 style={styles.title}>Password reset!</h2>
        <p style={styles.subtitle}>{successMessage}</p>

        <button
          type="button"
          style={styles.button}
          onClick={handleSignIn}
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...style }} className={`txl-reset-password-form ${className}`}>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.subtitle}>{subtitle}</p>

      {displayError && <div style={styles.error}>{displayError}</div>}

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="txl-reset-password">
            New password
          </label>
          <input
            id="txl-reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            style={styles.input}
            disabled={isLoading}
            autoComplete="new-password"
            required
            minLength={minPasswordLength}
          />
          <span style={styles.hint}>
            Must be at least {minPasswordLength} characters
          </span>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="txl-reset-confirm">
            Confirm password
          </label>
          <input
            id="txl-reset-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            style={styles.input}
            disabled={isLoading}
            autoComplete="new-password"
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
          {isLoading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
