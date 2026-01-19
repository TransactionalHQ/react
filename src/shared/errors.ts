/**
 * Transactional SDK Error Classes
 */

import { ErrorCode } from '../constants';

export class TransactionalError extends Error {
  code: ErrorCode;
  details?: unknown;

  constructor(message: string, code: ErrorCode, details?: unknown) {
    super(message);
    this.name = 'TransactionalError';
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends TransactionalError {
  constructor(message = 'Failed to connect to server') {
    super(message, ErrorCode.NETWORK_ERROR);
    this.name = 'NetworkError';
  }
}

export class UnauthorizedError extends TransactionalError {
  constructor(message = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends TransactionalError {
  constructor(message = 'Resource not found') {
    super(message, ErrorCode.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends TransactionalError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

export class ServerError extends TransactionalError {
  constructor(message = 'Internal server error') {
    super(message, ErrorCode.SERVER_ERROR);
    this.name = 'ServerError';
  }
}

export class RateLimitError extends TransactionalError {
  retryAfter?: number;

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, ErrorCode.RATE_LIMITED);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ConfigurationError extends TransactionalError {
  constructor(message: string) {
    super(message, ErrorCode.CONFIGURATION_ERROR);
    this.name = 'ConfigurationError';
  }
}

/**
 * Parse API error response and return appropriate error class
 */
export function parseApiError(response: Response, data?: { error?: { code?: string; message?: string } }): TransactionalError {
  const message = data?.error?.message || response.statusText || 'Unknown error';

  switch (response.status) {
    case 401:
      return new UnauthorizedError(message);
    case 404:
      return new NotFoundError(message);
    case 422:
      return new ValidationError(message, data?.error);
    case 429:
      const retryAfter = response.headers.get('Retry-After');
      return new RateLimitError(message, retryAfter ? parseInt(retryAfter, 10) : undefined);
    case 500:
    case 502:
    case 503:
      return new ServerError(message);
    default:
      return new TransactionalError(message, ErrorCode.SERVER_ERROR);
  }
}
