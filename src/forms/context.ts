/**
 * Forms Context
 *
 * Context and types for the forms components.
 */

import { createContext } from 'react';
import { FormFieldType, FormStatus } from '../constants';

// ============================================
// TYPES
// ============================================

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  order: number;
}

export interface FormConfig {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  submitText?: string;
  successMessage?: string;
  redirectUrl?: string;
}

export interface FormValues {
  [fieldId: string]: string | string[] | boolean | number | File | null;
}

export interface FormErrors {
  [fieldId: string]: string;
}

export interface FormState {
  config: FormConfig | null;
  values: FormValues;
  errors: FormErrors;
  touched: Set<string>;
  status: FormStatus;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface FormContextValue extends FormState {
  // Value management
  setValue: (fieldId: string, value: FormValues[string]) => void;
  setValues: (values: FormValues) => void;
  getValue: (fieldId: string) => FormValues[string];

  // Validation
  validateField: (fieldId: string) => string | null;
  validateForm: () => boolean;
  setFieldError: (fieldId: string, error: string) => void;
  clearFieldError: (fieldId: string) => void;

  // Touch state
  touchField: (fieldId: string) => void;
  isTouched: (fieldId: string) => boolean;

  // Form actions
  submit: () => Promise<void>;
  reset: () => void;
  loadForm: (formId: string) => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

export const FormContext = createContext<FormContextValue | null>(null);
