/**
 * Forms Module
 *
 * Components and hooks for dynamic forms.
 */

// Provider
export { FormProvider } from './provider';
export type { FormProviderProps } from './provider';

// Context
export { FormContext } from './context';
export type {
  FormFieldOption,
  FormField,
  FormConfig,
  FormValues,
  FormErrors,
  FormState,
  FormContextValue,
} from './context';

// Hooks
export {
  useFormContext,
  useForm,
  useFormField,
  useFormSubmit,
} from './hooks';

// Components
export { TransactionalForm } from './components/transactional-form';
export type { TransactionalFormProps } from './components/transactional-form';

export { FieldRenderer } from './components/field-renderer';
export type { FieldRendererProps } from './components/field-renderer';
