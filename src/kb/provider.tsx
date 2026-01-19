'use client';

/**
 * KBProvider
 *
 * Provider component for knowledge base functionality.
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useTransactional } from '../provider';
import { createKBApiClient, KBApiClient } from './api-client';
import {
  KBContext,
  KBContextValue,
  KBState,
  KBOrganization,
  KBSettings,
  KBCollection,
  KBArticle,
  KBSearchResult,
} from './context';

// ============================================
// STATE MANAGEMENT
// ============================================

type KBAction =
  | { type: 'SET_ORGANIZATION'; payload: KBOrganization }
  | { type: 'SET_SETTINGS'; payload: KBSettings | null }
  | { type: 'SET_COLLECTIONS'; payload: KBCollection[] }
  | { type: 'SET_RECENT_ARTICLES'; payload: KBArticle[] }
  | { type: 'SET_CURRENT_ARTICLE'; payload: KBArticle | null }
  | { type: 'SET_CURRENT_COLLECTION'; payload: KBCollection | null }
  | { type: 'SET_COLLECTION_ARTICLES'; payload: KBArticle[] }
  | { type: 'SET_SEARCH_RESULTS'; payload: KBSearchResult[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: KBState = {
  organization: null,
  settings: null,
  collections: [],
  recentArticles: [],
  currentArticle: null,
  currentCollection: null,
  collectionArticles: [],
  searchResults: [],
  searchQuery: '',
  isLoading: false,
  isInitialized: false,
  error: null,
};

function kbReducer(state: KBState, action: KBAction): KBState {
  switch (action.type) {
    case 'SET_ORGANIZATION':
      return { ...state, organization: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'SET_RECENT_ARTICLES':
      return { ...state, recentArticles: action.payload };
    case 'SET_CURRENT_ARTICLE':
      return { ...state, currentArticle: action.payload };
    case 'SET_CURRENT_COLLECTION':
      return { ...state, currentCollection: action.payload };
    case 'SET_COLLECTION_ARTICLES':
      return { ...state, collectionArticles: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ============================================
// PROVIDER
// ============================================

export interface KBProviderProps {
  children: React.ReactNode;
  /** Organization slug - required */
  orgSlug: string;
  /** Base URL for the KB API (defaults to web app URL) */
  baseUrl?: string;
  /** Auto-load home data on mount */
  autoLoad?: boolean;
  /** Callback on error */
  onError?: (error: string) => void;
}

export function KBProvider({
  children,
  orgSlug,
  baseUrl,
  autoLoad = true,
  onError,
}: KBProviderProps): React.ReactElement {
  const { config, httpClient } = useTransactional();
  const [state, dispatch] = useReducer(kbReducer, initialState);
  const apiClientRef = useRef<KBApiClient | null>(null);
  const loadingRef = useRef(false);

  // Create API client
  const apiClient = useMemo(() => {
    // Use provided baseUrl or config baseUrl (which should point to the web app for KB)
    const url = baseUrl || config.baseUrl || 'https://usetransactional.com';
    apiClientRef.current = createKBApiClient(httpClient, url, orgSlug);
    return apiClientRef.current;
  }, [httpClient, baseUrl, config.baseUrl, orgSlug]);

  // Load home data
  const loadHome = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await apiClient.getHome();

      dispatch({ type: 'SET_ORGANIZATION', payload: response.organization });
      dispatch({ type: 'SET_SETTINGS', payload: response.settings });
      dispatch({ type: 'SET_COLLECTIONS', payload: response.collections });
      dispatch({ type: 'SET_RECENT_ARTICLES', payload: response.recentArticles });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load knowledge base';
      dispatch({ type: 'SET_ERROR', payload: message });
      onError?.(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      loadingRef.current = false;
    }
  }, [apiClient, onError]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !state.isInitialized && !loadingRef.current) {
      loadHome();
    }
  }, [autoLoad, loadHome, state.isInitialized]);

  // Load collection
  const loadCollection = useCallback(
    async (collectionSlug: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const response = await apiClient.getCollection(collectionSlug);

        dispatch({ type: 'SET_CURRENT_COLLECTION', payload: response.collection });
        dispatch({ type: 'SET_COLLECTION_ARTICLES', payload: response.articles });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load collection';
        dispatch({ type: 'SET_ERROR', payload: message });
        onError?.(message);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [apiClient, onError]
  );

  // Load article
  const loadArticle = useCallback(
    async (articleSlug: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const response = await apiClient.getArticle(articleSlug);

        dispatch({ type: 'SET_CURRENT_ARTICLE', payload: response.article });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load article';
        dispatch({ type: 'SET_ERROR', payload: message });
        onError?.(message);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [apiClient, onError]
  );

  // Search
  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
        dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });

      try {
        const response = await apiClient.search(query);
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.results });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Search failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        onError?.(message);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [apiClient, onError]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
  }, []);

  // Submit feedback
  const submitFeedback = useCallback(
    async (articleId: number, isHelpful: boolean, comment?: string) => {
      try {
        await apiClient.submitFeedback(articleId, isHelpful, comment);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to submit feedback';
        dispatch({ type: 'SET_ERROR', payload: message });
        onError?.(message);
        throw error;
      }
    },
    [apiClient, onError]
  );

  // Context value
  const contextValue = useMemo<KBContextValue>(
    () => ({
      ...state,
      loadHome,
      loadCollection,
      loadArticle,
      search,
      clearSearch,
      submitFeedback,
    }),
    [state, loadHome, loadCollection, loadArticle, search, clearSearch, submitFeedback]
  );

  return <KBContext.Provider value={contextValue}>{children}</KBContext.Provider>;
}
