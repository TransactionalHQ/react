/**
 * HTTP Client for Transactional API
 */

import { NetworkError, parseApiError, TransactionalError } from './errors';

export interface HttpClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Create an HTTP client instance
 */
export function createHttpClient(config: HttpClientConfig) {
  const { baseUrl, headers: defaultHeaders = {}, timeout: defaultTimeout = 30000 } = config;

  /**
   * Make an HTTP request
   */
  async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, timeout = defaultTimeout } = options;

    const url = `${baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse JSON response
      let data: T | ApiError;
      try {
        data = await response.json();
      } catch {
        if (!response.ok) {
          throw parseApiError(response);
        }
        // Empty response is OK for some endpoints
        return {} as T;
      }

      // Check for error response
      if (!response.ok) {
        throw parseApiError(response, data as ApiError);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof TransactionalError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timed out');
        }
        throw new NetworkError(error.message);
      }

      throw new NetworkError('Unknown error occurred');
    }
  }

  /**
   * GET request
   */
  function get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  function post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  function put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  function patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  function del<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
