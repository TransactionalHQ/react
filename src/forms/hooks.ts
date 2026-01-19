'use client';

/**
 * Forms Hooks
 *
 * React hooks for interacting with forms.
 */

import { useContext, useCallback, useMemo } from 'react';
import { FormContext, FormContextValue, FormValues, FormField } from './context';
import { FormStatus, FormFieldType } from '../constants';

/**
 * Hook to access the full form context
 */
export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

/**
 * Main hook for form management
 *
 * @example
 * ```tsx
 * const { values, setValue, submit, isSubmitting } = useForm();
 *
 * // Update field value
 * setValue('email', 'user@example.com');
 *
 * // Submit form
 * await submit();
 * ```
 */
export function useForm() {
  const context = useFormContext();

  return {
    // Form config
    config: context.config,
    fields: context.config?.fields ?? [],

    // Values
    values: context.values,
    setValue: context.setValue,
    setValues: context.setValues,
    getValue: context.getValue,

    // Errors
    errors: context.errors,
    setFieldError: context.setFieldError,
    clearFieldError: context.clearFieldError,

    // Validation
    validateField: context.validateField,
    validateForm: context.validateForm,

    // Touch state
    touched: context.touched,
    touchField: context.touchField,
    isTouched: context.isTouched,

    // Status
    status: context.status,
    isIdle: context.status === FormStatus.IDLE,
    isSubmitting: context.status === FormStatus.SUBMITTING,
    isSuccess: context.status === FormStatus.SUCCESS,
    isError: context.status === FormStatus.ERROR,
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    error: context.error,

    // Actions
    submit: context.submit,
    reset: context.reset,
    loadForm: context.loadForm,
  };
}

/**
 * Hook for a specific form field
 *
 * @param fieldId - The field ID
 *
 * @example
 * ```tsx
 * const { field, value, error, setValue, onBlur } = useFormField('email');
 *
 * return (
 *   <input
 *     type={field.type}
 *     value={value}
 *     onChange={(e) => setValue(e.target.value)}
 *     onBlur={onBlur}
 *   />
 * );
 * ```
 */
export function useFormField(fieldId: string) {
  const context = useFormContext();

  const field = useMemo((): FormField | null => {
    return context.config?.fields.find((f) => f.id === fieldId) ?? null;
  }, [context.config?.fields, fieldId]);

  const value = context.getValue(fieldId);
  const error = context.errors[fieldId];
  const touched = context.isTouched(fieldId);

  const setValue = useCallback(
    (newValue: FormValues[string]) => {
      context.setValue(fieldId, newValue);
    },
    [context, fieldId]
  );

  const onBlur = useCallback(() => {
    context.touchField(fieldId);
    context.validateField(fieldId);
  }, [context, fieldId]);

  const validate = useCallback(() => {
    return context.validateField(fieldId);
  }, [context, fieldId]);

  return {
    field,
    value,
    error,
    touched,
    showError: touched && !!error,
    setValue,
    onBlur,
    validate,
  };
}

/**
 * Hook for form submission handling
 *
 * @example
 * ```tsx
 * const { handleSubmit, isSubmitting, isSuccess } = useFormSubmit({
 *   onSuccess: (data) => console.log('Submitted!', data),
 *   onError: (error) => console.error('Failed:', error),
 * });
 *
 * return <form onSubmit={handleSubmit}>...</form>;
 * ```
 */
export function useFormSubmit(options?: {
  onSuccess?: (data: { submissionId?: string }) => void;
  onError?: (error: string) => void;
}) {
  const context = useFormContext();

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!context.validateForm()) {
        return;
      }

      try {
        await context.submit();
        options?.onSuccess?.({});
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Submission failed';
        options?.onError?.(message);
      }
    },
    [context, options]
  );

  return {
    handleSubmit,
    isSubmitting: context.status === FormStatus.SUBMITTING,
    isSuccess: context.status === FormStatus.SUCCESS,
    isError: context.status === FormStatus.ERROR,
    error: context.error,
  };
}
