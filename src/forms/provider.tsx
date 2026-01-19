'use client';

/**
 * FormProvider
 *
 * Provider component for form functionality.
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { FormStatus, FormFieldType } from '../constants';
import { useTransactional } from '../provider';
import { createFormsApiClient, FormsApiClient } from './api-client';
import {
  FormContext,
  FormContextValue,
  FormState,
  FormConfig,
  FormValues,
  FormErrors,
  FormField,
} from './context';

// ============================================
// STATE MANAGEMENT
// ============================================

type FormAction =
  | { type: 'SET_CONFIG'; payload: FormConfig }
  | { type: 'SET_VALUE'; payload: { fieldId: string; value: FormValues[string] } }
  | { type: 'SET_VALUES'; payload: FormValues }
  | { type: 'SET_ERROR'; payload: { fieldId: string; error: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SET_ERRORS'; payload: FormErrors }
  | { type: 'TOUCH_FIELD'; payload: string }
  | { type: 'SET_STATUS'; payload: FormStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_FORM_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: FormState = {
  config: null,
  values: {},
  errors: {},
  touched: new Set(),
  status: FormStatus.IDLE,
  isLoading: false,
  isInitialized: false,
  error: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
        values: getDefaultValues(action.payload.fields),
        errors: {},
        touched: new Set(),
        status: FormStatus.IDLE,
      };
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.payload.fieldId]: action.payload.value },
      };
    case 'SET_VALUES':
      return { ...state, values: { ...state.values, ...action.payload } };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.fieldId]: action.payload.error },
      };
    case 'CLEAR_ERROR': {
      const { [action.payload]: _, ...remainingErrors } = state.errors;
      return { ...state, errors: remainingErrors };
    }
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'TOUCH_FIELD':
      return { ...state, touched: new Set([...state.touched, action.payload]) };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'SET_FORM_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return {
        ...state,
        values: state.config ? getDefaultValues(state.config.fields) : {},
        errors: {},
        touched: new Set(),
        status: FormStatus.IDLE,
        error: null,
      };
    default:
      return state;
  }
}

function getDefaultValues(fields: FormField[]): FormValues {
  const values: FormValues = {};
  fields.forEach((field) => {
    switch (field.type) {
      case FormFieldType.CHECKBOX:
        values[field.id] = false;
        break;
      case FormFieldType.NUMBER:
        values[field.id] = null;
        break;
      default:
        values[field.id] = '';
    }
  });
  return values;
}

// ============================================
// VALIDATION
// ============================================

function validateFieldValue(field: FormField, value: FormValues[string]): string | null {
  // Required check
  if (field.required) {
    if (value === null || value === undefined || value === '') {
      return `${field.label} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${field.label} is required`;
    }
  }

  // Type-specific validation
  if (value !== null && value !== undefined && value !== '') {
    const strValue = String(value);

    switch (field.type) {
      case FormFieldType.EMAIL:
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
          return 'Please enter a valid email address';
        }
        break;

      case FormFieldType.PHONE:
        if (!/^[\d\s\-+()]+$/.test(strValue)) {
          return 'Please enter a valid phone number';
        }
        break;

      case FormFieldType.NUMBER:
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return 'Please enter a valid number';
        }
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          return `Value must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          return `Value must be at most ${field.validation.max}`;
        }
        break;
    }

    // Length validation
    if (field.validation?.minLength && strValue.length < field.validation.minLength) {
      return `Must be at least ${field.validation.minLength} characters`;
    }
    if (field.validation?.maxLength && strValue.length > field.validation.maxLength) {
      return `Must be at most ${field.validation.maxLength} characters`;
    }

    // Pattern validation
    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(strValue)) {
        return 'Invalid format';
      }
    }
  }

  return null;
}

// ============================================
// PROVIDER
// ============================================

export interface FormProviderProps {
  children: React.ReactNode;
  /** Form ID to load */
  formId?: string;
  /** Pre-loaded form config (skip API fetch) */
  config?: FormConfig;
  /** Initial field values */
  initialValues?: FormValues;
  /** Callback on successful submission */
  onSuccess?: (data: { submissionId?: string }) => void;
  /** Callback on submission error */
  onError?: (error: string) => void;
  /** Callback when values change */
  onChange?: (values: FormValues) => void;
}

export function FormProvider({
  children,
  formId,
  config: propConfig,
  initialValues,
  onSuccess,
  onError,
  onChange,
}: FormProviderProps): React.ReactElement {
  const { httpClient } = useTransactional();
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    values: initialValues ?? {},
  });
  const apiClientRef = useRef<FormsApiClient | null>(null);

  // Create API client
  const apiClient = useMemo(() => {
    apiClientRef.current = createFormsApiClient(httpClient);
    return apiClientRef.current;
  }, [httpClient]);

  // Load form config
  const loadForm = useCallback(
    async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_FORM_ERROR', payload: null });

      try {
        const response = await apiClient.getForm(id);
        dispatch({ type: 'SET_CONFIG', payload: response.form });

        // Apply initial values if provided
        if (initialValues) {
          dispatch({ type: 'SET_VALUES', payload: initialValues });
        }

        dispatch({ type: 'SET_INITIALIZED', payload: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load form';
        dispatch({ type: 'SET_FORM_ERROR', payload: message });
        onError?.(message);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [apiClient, initialValues, onError]
  );

  // Initialize with prop config or load from API
  useEffect(() => {
    if (propConfig) {
      dispatch({ type: 'SET_CONFIG', payload: propConfig });
      if (initialValues) {
        dispatch({ type: 'SET_VALUES', payload: initialValues });
      }
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } else if (formId && !state.isInitialized) {
      loadForm(formId);
    }
  }, [propConfig, formId, loadForm, initialValues, state.isInitialized]);

  // Value management
  const setValue = useCallback(
    (fieldId: string, value: FormValues[string]) => {
      dispatch({ type: 'SET_VALUE', payload: { fieldId, value } });
      onChange?.({ ...state.values, [fieldId]: value });
    },
    [onChange, state.values]
  );

  const setValues = useCallback(
    (values: FormValues) => {
      dispatch({ type: 'SET_VALUES', payload: values });
      onChange?.({ ...state.values, ...values });
    },
    [onChange, state.values]
  );

  const getValue = useCallback(
    (fieldId: string): FormValues[string] => {
      return state.values[fieldId] ?? null;
    },
    [state.values]
  );

  // Validation
  const validateField = useCallback(
    (fieldId: string): string | null => {
      const field = state.config?.fields.find((f) => f.id === fieldId);
      if (!field) return null;

      const error = validateFieldValue(field, state.values[fieldId]);

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: { fieldId, error } });
      } else {
        dispatch({ type: 'CLEAR_ERROR', payload: fieldId });
      }

      return error;
    },
    [state.config?.fields, state.values]
  );

  const validateForm = useCallback((): boolean => {
    if (!state.config) return false;

    const errors: FormErrors = {};
    let isValid = true;

    state.config.fields.forEach((field) => {
      const error = validateFieldValue(field, state.values[field.id]);
      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    });

    dispatch({ type: 'SET_ERRORS', payload: errors });
    return isValid;
  }, [state.config, state.values]);

  const setFieldError = useCallback((fieldId: string, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { fieldId, error } });
  }, []);

  const clearFieldError = useCallback((fieldId: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: fieldId });
  }, []);

  // Touch state
  const touchField = useCallback((fieldId: string) => {
    dispatch({ type: 'TOUCH_FIELD', payload: fieldId });
  }, []);

  const isTouched = useCallback(
    (fieldId: string): boolean => {
      return state.touched.has(fieldId);
    },
    [state.touched]
  );

  // Submit
  const submit = useCallback(async () => {
    if (!state.config || !formId) {
      throw new Error('Form not initialized');
    }

    if (!validateForm()) {
      return;
    }

    dispatch({ type: 'SET_STATUS', payload: FormStatus.SUBMITTING });
    dispatch({ type: 'SET_FORM_ERROR', payload: null });

    try {
      const response = await apiClient.submitForm(formId, state.values);

      if (response.success) {
        dispatch({ type: 'SET_STATUS', payload: FormStatus.SUCCESS });
        onSuccess?.({ submissionId: response.submissionId });

        // Handle redirect
        if (response.redirectUrl && typeof window !== 'undefined') {
          window.location.href = response.redirectUrl;
        }
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Submission failed';
      dispatch({ type: 'SET_STATUS', payload: FormStatus.ERROR });
      dispatch({ type: 'SET_FORM_ERROR', payload: message });
      onError?.(message);
      throw error;
    }
  }, [apiClient, formId, state.config, state.values, validateForm, onSuccess, onError]);

  // Reset
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Context value
  const contextValue = useMemo<FormContextValue>(
    () => ({
      ...state,
      setValue,
      setValues,
      getValue,
      validateField,
      validateForm,
      setFieldError,
      clearFieldError,
      touchField,
      isTouched,
      submit,
      reset,
      loadForm,
    }),
    [
      state,
      setValue,
      setValues,
      getValue,
      validateField,
      validateForm,
      setFieldError,
      clearFieldError,
      touchField,
      isTouched,
      submit,
      reset,
      loadForm,
    ]
  );

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
}
