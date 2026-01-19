'use client';

/**
 * TransactionalForm
 *
 * Complete form component that loads and renders a form.
 */

import React from 'react';
import { useForm, useFormSubmit } from '../hooks';
import { FormProvider } from '../provider';
import { FieldRenderer } from './field-renderer';
import { FormStatus } from '../../constants';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    width: '100%',
    maxWidth: '500px',
    fontFamily: 'var(--txl-font-family)',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    marginBottom: '8px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  submitButton: {
    width: '100%',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '500',
    border: 'none',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
    marginTop: '8px',
  },
  submitButtonDisabled: {
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
    marginBottom: '16px',
  },
  success: {
    padding: '32px',
    textAlign: 'center' as const,
  },
  successIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto 16px',
    color: 'var(--txl-success)',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    marginBottom: '8px',
  },
  successMessage: {
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
    lineHeight: '1.5',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
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
// ICONS
// ============================================

function CheckCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ============================================
// INNER FORM COMPONENT
// ============================================

interface InnerFormProps {
  showTitle: boolean;
  submitText?: string;
  successMessage?: string;
  hideOnSuccess: boolean;
  onSuccess?: () => void;
  className: string;
  style: React.CSSProperties;
}

function InnerForm({
  showTitle,
  submitText,
  successMessage,
  hideOnSuccess,
  onSuccess,
  className,
  style,
}: InnerFormProps): React.ReactElement {
  const {
    config,
    fields,
    status,
    isLoading,
    isInitialized,
    error,
  } = useForm();

  const { handleSubmit, isSubmitting, isSuccess } = useFormSubmit({
    onSuccess: () => onSuccess?.(),
  });

  if (isLoading && !isInitialized) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.error}>Form not found</div>
      </div>
    );
  }

  // Success state
  if (isSuccess && hideOnSuccess) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.success}>
          <div style={styles.successIcon}>
            <CheckCircleIcon />
          </div>
          <div style={styles.successTitle}>Thank you!</div>
          <div style={styles.successMessage}>
            {successMessage || config.successMessage || 'Your submission has been received.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...style }} className={`txl-form ${className}`}>
      {/* Header */}
      {showTitle && (config.name || config.description) && (
        <div style={styles.header}>
          {config.name && <h2 style={styles.title}>{config.name}</h2>}
          {config.description && <p style={styles.description}>{config.description}</p>}
        </div>
      )}

      {/* Error */}
      {error && status === FormStatus.ERROR && (
        <div style={styles.error}>{error}</div>
      )}

      {/* Form */}
      <form style={styles.form} onSubmit={handleSubmit} noValidate>
        {fields
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <FieldRenderer key={field.id} field={field} disabled={isSubmitting} />
          ))}

        <button
          type="submit"
          style={{
            ...styles.submitButton,
            ...(isSubmitting ? styles.submitButtonDisabled : {}),
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : submitText || config.submitText || 'Submit'}
        </button>
      </form>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export interface TransactionalFormProps {
  /** Form ID to load */
  formId: string;
  /** Show form title and description */
  showTitle?: boolean;
  /** Custom submit button text */
  submitText?: string;
  /** Custom success message */
  successMessage?: string;
  /** Hide form on successful submission */
  hideOnSuccess?: boolean;
  /** Initial field values */
  initialValues?: Record<string, any>;
  /** Callback on successful submission */
  onSuccess?: () => void;
  /** Callback on submission error */
  onError?: (error: string) => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function TransactionalForm({
  formId,
  showTitle = true,
  submitText,
  successMessage,
  hideOnSuccess = true,
  initialValues,
  onSuccess,
  onError,
  className = '',
  style = {},
}: TransactionalFormProps): React.ReactElement {
  return (
    <FormProvider
      formId={formId}
      initialValues={initialValues}
      onSuccess={() => onSuccess?.()}
      onError={onError}
    >
      <InnerForm
        showTitle={showTitle}
        submitText={submitText}
        successMessage={successMessage}
        hideOnSuccess={hideOnSuccess}
        onSuccess={onSuccess}
        className={className}
        style={style}
      />
    </FormProvider>
  );
}
