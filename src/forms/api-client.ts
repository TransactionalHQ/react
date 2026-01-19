/**
 * Forms API Client
 *
 * Client for the public forms API endpoints.
 */

import { HttpClient } from '../shared/http-client';
import { FormConfig, FormValues } from './context';

// ============================================
// TYPES
// ============================================

export interface FormConfigResponse {
  form: FormConfig;
}

export interface FormSubmitResponse {
  success: boolean;
  submissionId?: string;
  redirectUrl?: string;
  message?: string;
}

// ============================================
// API CLIENT
// ============================================

export function createFormsApiClient(httpClient: HttpClient) {
  /**
   * Get form configuration
   */
  async function getForm(formId: string): Promise<FormConfigResponse> {
    return httpClient.get<FormConfigResponse>(`/f/${formId}`);
  }

  /**
   * Submit form
   */
  async function submitForm(
    formId: string,
    values: FormValues
  ): Promise<FormSubmitResponse> {
    // Convert values to FormData for file uploads or JSON for regular data
    const hasFiles = Object.values(values).some(v => v instanceof File);

    if (hasFiles) {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      return httpClient.post<FormSubmitResponse>(`/f/${formId}/submit`, formData, {
        headers: {
          // Let browser set content-type for FormData
          'Content-Type': undefined as any,
        },
      });
    }

    return httpClient.post<FormSubmitResponse>(`/f/${formId}/submit`, values);
  }

  return {
    getForm,
    submitForm,
  };
}

export type FormsApiClient = ReturnType<typeof createFormsApiClient>;
