'use client';

/**
 * FieldRenderer
 *
 * Renders a form field based on its type.
 */

import React, { useCallback } from 'react';
import { useFormField } from '../hooks';
import { FormField, FormValues } from '../context';
import { FormFieldType } from '../../constants';

// ============================================
// STYLES
// ============================================

const styles = {
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--txl-foreground)',
  },
  required: {
    color: 'var(--txl-destructive)',
    marginLeft: '2px',
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
    fontFamily: 'var(--txl-font-family)',
  },
  inputError: {
    borderColor: 'var(--txl-destructive)',
  },
  textarea: {
    minHeight: '100px',
    resize: 'vertical' as const,
  },
  select: {
    cursor: 'pointer',
  },
  checkboxWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: 'var(--txl-foreground)',
    cursor: 'pointer',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  radioWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  radioLabel: {
    fontSize: '14px',
    color: 'var(--txl-foreground)',
    cursor: 'pointer',
  },
  error: {
    fontSize: '13px',
    color: 'var(--txl-destructive)',
  },
  hint: {
    fontSize: '13px',
    color: 'var(--txl-muted-foreground)',
  },
  fileInput: {
    display: 'none',
  },
  fileButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    border: '1px dashed var(--txl-border)',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-background)',
    color: 'var(--txl-muted-foreground)',
    cursor: 'pointer',
    transition: 'border-color 150ms ease, background-color 150ms ease',
  },
  fileName: {
    marginTop: '8px',
    fontSize: '13px',
    color: 'var(--txl-foreground)',
  },
};

// ============================================
// COMPONENT
// ============================================

export interface FieldRendererProps {
  /** Field configuration */
  field: FormField;
  /** Disable the field */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function FieldRenderer({
  field,
  disabled = false,
  className = '',
  style = {},
}: FieldRendererProps): React.ReactElement {
  const { value, error, showError, setValue, onBlur } = useFormField(field.id);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const newValue = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setValue(newValue);
    },
    [setValue]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setValue(file);
    },
    [setValue]
  );

  const inputStyle = {
    ...styles.input,
    ...(showError ? styles.inputError : {}),
  };

  const renderInput = () => {
    switch (field.type) {
      case FormFieldType.TEXTAREA:
        return (
          <textarea
            id={field.id}
            name={field.name}
            value={String(value ?? '')}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
            style={{ ...inputStyle, ...styles.textarea }}
            aria-invalid={showError}
            aria-describedby={showError ? `${field.id}-error` : undefined}
          />
        );

      case FormFieldType.SELECT:
        return (
          <select
            id={field.id}
            name={field.name}
            value={String(value ?? '')}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            required={field.required}
            style={{ ...inputStyle, ...styles.select }}
            aria-invalid={showError}
            aria-describedby={showError ? `${field.id}-error` : undefined}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case FormFieldType.CHECKBOX:
        return (
          <div style={styles.checkboxWrapper}>
            <input
              type="checkbox"
              id={field.id}
              name={field.name}
              checked={Boolean(value)}
              onChange={handleChange}
              onBlur={onBlur}
              disabled={disabled}
              required={field.required}
              style={styles.checkbox}
              aria-invalid={showError}
              aria-describedby={showError ? `${field.id}-error` : undefined}
            />
            <label htmlFor={field.id} style={styles.checkboxLabel}>
              {field.label}
              {field.required && <span style={styles.required}>*</span>}
            </label>
          </div>
        );

      case FormFieldType.RADIO:
        return (
          <div style={styles.radioGroup} role="radiogroup" aria-labelledby={`${field.id}-label`}>
            {field.options?.map((option) => (
              <div key={option.value} style={styles.radioWrapper}>
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  onBlur={onBlur}
                  disabled={disabled}
                  required={field.required}
                  style={styles.radio}
                />
                <label htmlFor={`${field.id}-${option.value}`} style={styles.radioLabel}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case FormFieldType.FILE:
        return (
          <>
            <input
              type="file"
              id={field.id}
              name={field.name}
              onChange={handleFileChange}
              onBlur={onBlur}
              disabled={disabled}
              required={field.required}
              style={styles.fileInput}
              aria-invalid={showError}
              aria-describedby={showError ? `${field.id}-error` : undefined}
            />
            <label htmlFor={field.id} style={styles.fileButton}>
              Choose file
            </label>
            {value instanceof File && (
              <div style={styles.fileName}>{value.name}</div>
            )}
          </>
        );

      case FormFieldType.DATE:
        return (
          <input
            type="date"
            id={field.id}
            name={field.name}
            value={String(value ?? '')}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
            style={inputStyle}
            aria-invalid={showError}
            aria-describedby={showError ? `${field.id}-error` : undefined}
          />
        );

      case FormFieldType.NUMBER:
        return (
          <input
            type="number"
            id={field.id}
            name={field.name}
            value={value !== null && value !== undefined ? String(value) : ''}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            style={inputStyle}
            aria-invalid={showError}
            aria-describedby={showError ? `${field.id}-error` : undefined}
          />
        );

      case FormFieldType.EMAIL:
        return (
          <input
            type="email"
            id={field.id}
            name={field.name}
            value={String(value ?? '')}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={field.placeholder || 'you@example.com'}
            disabled={disabled}
            required={field.required}
            style={inputStyle}
            aria-invalid={showError}
            aria-describedby={showError ? `${field.id}-error` : undefined}
          />
        );

      case FormFieldType.PHONE:
        return (
          <input
            type="tel"
            id={field.id}
            name={field.name}
            value={String(value ?? '')}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={field.placeholder || '+1 (555) 000-0000'}
            disabled={disabled}
            required={field.required}
            style={inputStyle}
            aria-invalid={showError}
            aria-describedby={showError ? `${field.id}-error` : undefined}
          />
        );

      default:
        return (
          <input
            type="text"
            id={field.id}
            name={field.name}
            value={String(value ?? '')}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            style={inputStyle}
            aria-invalid={showError}
            aria-describedby={showError ? `${field.id}-error` : undefined}
          />
        );
    }
  };

  // Checkbox has its own label rendering
  if (field.type === FormFieldType.CHECKBOX) {
    return (
      <div style={{ ...styles.fieldGroup, ...style }} className={`txl-field ${className}`}>
        {renderInput()}
        {showError && (
          <span id={`${field.id}-error`} style={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ ...styles.fieldGroup, ...style }} className={`txl-field ${className}`}>
      <label
        id={`${field.id}-label`}
        htmlFor={field.id}
        style={styles.label}
      >
        {field.label}
        {field.required && <span style={styles.required}>*</span>}
      </label>
      {renderInput()}
      {showError && (
        <span id={`${field.id}-error`} style={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
