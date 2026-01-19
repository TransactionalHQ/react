/**
 * Knowledge Base Context
 *
 * Context and types for the knowledge base components.
 */

import { createContext } from 'react';

// ============================================
// TYPES
// ============================================

export interface KBOrganization {
  name: string;
  slug: string;
}

export interface KBSettings {
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  primaryColor?: string;
  searchEnabled: boolean;
  feedbackEnabled: boolean;
  contactEnabled: boolean;
}

export interface KBCollection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  articleCount?: number;
}

export interface KBArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  collectionSlug?: string;
  collectionName?: string;
  publishedAt?: string;
  viewCount?: number;
}

export interface KBSearchResult {
  id: number;
  title: string;
  slug: string;
  snippet?: string;
  collection?: {
    name: string;
    slug: string;
  };
  publishedAt?: string;
}

export interface KBState {
  organization: KBOrganization | null;
  settings: KBSettings | null;
  collections: KBCollection[];
  recentArticles: KBArticle[];
  currentArticle: KBArticle | null;
  currentCollection: KBCollection | null;
  collectionArticles: KBArticle[];
  searchResults: KBSearchResult[];
  searchQuery: string;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface KBContextValue extends KBState {
  // Data loading
  loadHome: () => Promise<void>;
  loadCollection: (collectionSlug: string) => Promise<void>;
  loadArticle: (articleSlug: string) => Promise<void>;

  // Search
  search: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Feedback
  submitFeedback: (articleId: number, isHelpful: boolean, comment?: string) => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

export const KBContext = createContext<KBContextValue | null>(null);
