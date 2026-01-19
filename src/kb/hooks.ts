'use client';

/**
 * Knowledge Base Hooks
 *
 * React hooks for interacting with the knowledge base.
 */

import { useContext, useCallback, useMemo, useEffect } from 'react';
import { KBContext, KBContextValue, KBArticle, KBCollection, KBSearchResult } from './context';

/**
 * Hook to access the full KB context
 */
export function useKBContext(): KBContextValue {
  const context = useContext(KBContext);
  if (!context) {
    throw new Error('useKBContext must be used within a KBProvider');
  }
  return context;
}

/**
 * Main hook for knowledge base access
 *
 * @example
 * ```tsx
 * const { collections, recentArticles, search, isLoading } = useKnowledgeBase();
 *
 * // Search articles
 * await search('getting started');
 * ```
 */
export function useKnowledgeBase() {
  const context = useKBContext();

  return {
    // Organization and settings
    organization: context.organization,
    settings: context.settings,

    // Collections and articles
    collections: context.collections,
    recentArticles: context.recentArticles,

    // Search
    searchResults: context.searchResults,
    searchQuery: context.searchQuery,
    search: context.search,
    clearSearch: context.clearSearch,

    // Loading state
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    error: context.error,

    // Actions
    loadHome: context.loadHome,
  };
}

/**
 * Hook for a specific collection
 *
 * @param collectionSlug - The collection slug to load
 *
 * @example
 * ```tsx
 * const { collection, articles, isLoading } = useCollection('getting-started');
 * ```
 */
export function useCollection(collectionSlug?: string) {
  const context = useKBContext();

  // Load collection when slug changes
  useEffect(() => {
    if (collectionSlug && context.currentCollection?.slug !== collectionSlug) {
      context.loadCollection(collectionSlug);
    }
  }, [collectionSlug, context.currentCollection?.slug, context.loadCollection]);

  return {
    collection: context.currentCollection,
    articles: context.collectionArticles,
    isLoading: context.isLoading,
    error: context.error,
    reload: () => collectionSlug && context.loadCollection(collectionSlug),
  };
}

/**
 * Hook for a specific article
 *
 * @param articleSlug - The article slug to load
 *
 * @example
 * ```tsx
 * const { article, isLoading, submitFeedback } = useArticle('quick-start-guide');
 *
 * // Submit feedback
 * await submitFeedback(true, 'Very helpful!');
 * ```
 */
export function useArticle(articleSlug?: string) {
  const context = useKBContext();

  // Load article when slug changes
  useEffect(() => {
    if (articleSlug && context.currentArticle?.slug !== articleSlug) {
      context.loadArticle(articleSlug);
    }
  }, [articleSlug, context.currentArticle?.slug, context.loadArticle]);

  const submitFeedback = useCallback(
    async (isHelpful: boolean, comment?: string) => {
      if (!context.currentArticle) {
        throw new Error('No article loaded');
      }
      return context.submitFeedback(context.currentArticle.id, isHelpful, comment);
    },
    [context.currentArticle, context.submitFeedback]
  );

  return {
    article: context.currentArticle,
    isLoading: context.isLoading,
    error: context.error,
    submitFeedback,
    reload: () => articleSlug && context.loadArticle(articleSlug),
  };
}

/**
 * Hook for KB search
 *
 * @example
 * ```tsx
 * const { results, query, search, clear, isSearching } = useKBSearch();
 *
 * // Perform search
 * await search('authentication');
 *
 * // Clear results
 * clear();
 * ```
 */
export function useKBSearch() {
  const context = useKBContext();

  return {
    results: context.searchResults,
    query: context.searchQuery,
    isSearching: context.isLoading && context.searchQuery.length > 0,
    hasResults: context.searchResults.length > 0,
    search: context.search,
    clear: context.clearSearch,
  };
}
