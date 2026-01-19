/**
 * Storage utilities for visitor identification and session management
 */

const STORAGE_PREFIX = 'txl_';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Safe localStorage wrapper that handles SSR
 */
const safeLocalStorage: StorageAdapter = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors (e.g., private browsing)
    }
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

/**
 * Safe sessionStorage wrapper that handles SSR
 */
const safeSessionStorage: StorageAdapter = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Ignore storage errors
    }
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

/**
 * Create a prefixed storage key
 */
function createKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Store visitor UUID
 */
export function storeVisitorUuid(uuid: string): void {
  safeLocalStorage.setItem(createKey('visitor_uuid'), uuid);
}

/**
 * Get stored visitor UUID
 */
export function getVisitorUuid(): string | null {
  return safeLocalStorage.getItem(createKey('visitor_uuid'));
}

/**
 * Clear visitor UUID
 */
export function clearVisitorUuid(): void {
  safeLocalStorage.removeItem(createKey('visitor_uuid'));
}

/**
 * Store session ID
 */
export function storeSessionId(sessionId: string): void {
  safeSessionStorage.setItem(createKey('session_id'), sessionId);
}

/**
 * Get stored session ID
 */
export function getSessionId(): string | null {
  return safeSessionStorage.getItem(createKey('session_id'));
}

/**
 * Generate a new session ID
 */
export function generateSessionId(): string {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  storeSessionId(sessionId);
  return sessionId;
}

/**
 * Get or create session ID
 */
export function getOrCreateSessionId(): string {
  const existing = getSessionId();
  if (existing) return existing;
  return generateSessionId();
}

/**
 * Store widget state (open/closed)
 */
export function storeWidgetState(state: string): void {
  safeSessionStorage.setItem(createKey('widget_state'), state);
}

/**
 * Get stored widget state
 */
export function getWidgetState(): string | null {
  return safeSessionStorage.getItem(createKey('widget_state'));
}

/**
 * Store auth tokens
 */
export function storeAuthToken(token: string): void {
  safeLocalStorage.setItem(createKey('auth_token'), token);
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  return safeLocalStorage.getItem(createKey('auth_token'));
}

/**
 * Clear auth token
 */
export function clearAuthToken(): void {
  safeLocalStorage.removeItem(createKey('auth_token'));
}

/**
 * Store any value as JSON
 */
export function storeJson<T>(key: string, value: T, useSession = false): void {
  const storage = useSession ? safeSessionStorage : safeLocalStorage;
  try {
    storage.setItem(createKey(key), JSON.stringify(value));
  } catch {
    // Ignore serialization errors
  }
}

/**
 * Get stored JSON value
 */
export function getJson<T>(key: string, useSession = false): T | null {
  const storage = useSession ? safeSessionStorage : safeLocalStorage;
  try {
    const value = storage.getItem(createKey(key));
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Remove stored JSON value
 */
export function removeJson(key: string, useSession = false): void {
  const storage = useSession ? safeSessionStorage : safeLocalStorage;
  storage.removeItem(createKey(key));
}
