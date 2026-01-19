/**
 * Knowledge Base API Client
 *
 * Client for the public KB API endpoints.
 */

import { HttpClient } from '../shared/http-client';
import {
  KBOrganization,
  KBSettings,
  KBCollection,
  KBArticle,
  KBSearchResult,
} from './context';

// ============================================
// TYPES
// ============================================

export interface KBHomeResponse {
  organization: KBOrganization;
  settings: KBSettings | null;
  collections: KBCollection[];
  recentArticles: KBArticle[];
}

export interface KBCollectionResponse {
  collection: KBCollection;
  articles: KBArticle[];
  subcollections?: KBCollection[];
}

export interface KBArticleResponse {
  article: KBArticle & {
    content: string;
    collection?: {
      name: string;
      slug: string;
    };
    relatedArticles?: KBArticle[];
  };
}

export interface KBSearchResponse {
  query: string;
  results: KBSearchResult[];
  total: number;
  format: 'html' | 'markdown';
}

// ============================================
// API CLIENT
// ============================================

export function createKBApiClient(httpClient: HttpClient, baseUrl: string, orgSlug: string) {
  // Use the web app's public KB API
  const kbPath = `/api/public/kb/${orgSlug}`;

  /**
   * Get KB homepage data
   */
  async function getHome(): Promise<KBHomeResponse> {
    return httpClient.get<KBHomeResponse>(kbPath);
  }

  /**
   * Get collection with articles
   */
  async function getCollection(collectionSlug: string): Promise<KBCollectionResponse> {
    return httpClient.get<KBCollectionResponse>(`${kbPath}/${collectionSlug}`);
  }

  /**
   * Get article
   */
  async function getArticle(articleSlug: string): Promise<KBArticleResponse> {
    return httpClient.get<KBArticleResponse>(`${kbPath}/articles/${articleSlug}`);
  }

  /**
   * Search articles
   */
  async function search(query: string, limit = 20): Promise<KBSearchResponse> {
    return httpClient.get<KBSearchResponse>(
      `${kbPath}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  /**
   * Submit article feedback
   */
  async function submitFeedback(
    articleId: number,
    isHelpful: boolean,
    comment?: string
  ): Promise<{ success: boolean }> {
    return httpClient.post<{ success: boolean }>(
      `${kbPath}/articles/${articleId}/feedback`,
      {
        isHelpful,
        comment,
      }
    );
  }

  return {
    getHome,
    getCollection,
    getArticle,
    search,
    submitFeedback,
  };
}

export type KBApiClient = ReturnType<typeof createKBApiClient>;
