'use client';

/**
 * KnowledgeBase
 *
 * Full-page knowledge base component with navigation.
 */

import React, { useState, useCallback } from 'react';
import { useKnowledgeBase } from '../hooks';
import { KBArticle, KBCollection, KBSearchResult } from '../context';
import { KBLayout } from '../../constants';
import { SearchBox } from './search-box';
import { CollectionView } from './collection-view';
import { ArticleView } from './article-view';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--txl-background)',
    fontFamily: 'var(--txl-font-family)',
  },
  header: {
    padding: '48px 24px',
    textAlign: 'center' as const,
    backgroundColor: 'var(--txl-muted)',
    borderBottom: '1px solid var(--txl-border)',
  },
  logo: {
    maxHeight: '40px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--txl-foreground)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--txl-muted-foreground)',
    marginBottom: '24px',
  },
  searchWrapper: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    marginBottom: '16px',
  },
  collectionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '48px',
  },
  collectionCard: {
    padding: '20px',
    borderRadius: 'var(--txl-radius-lg)',
    border: '1px solid var(--txl-border)',
    backgroundColor: 'var(--txl-card)',
    cursor: 'pointer',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  },
  collectionCardHover: {
    borderColor: 'var(--txl-primary)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  collectionIcon: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  collectionName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    marginBottom: '4px',
  },
  collectionDescription: {
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
    lineHeight: '1.4',
    marginBottom: '8px',
  },
  collectionCount: {
    fontSize: '13px',
    color: 'var(--txl-muted-foreground)',
  },
  articlesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  articleItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-card)',
    border: '1px solid var(--txl-border)',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  articleItemHover: {
    backgroundColor: 'var(--txl-muted)',
  },
  articleTitle: {
    fontSize: '15px',
    color: 'var(--txl-foreground)',
  },
  articleCollection: {
    fontSize: '13px',
    color: 'var(--txl-muted-foreground)',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '2px solid var(--txl-muted)',
    borderTopColor: 'var(--txl-primary)',
    borderRadius: '50%',
    animation: 'txl-spin 1s linear infinite',
  },
  error: {
    padding: '48px',
    textAlign: 'center' as const,
    color: 'var(--txl-destructive)',
  },
};

// ============================================
// VIEWS
// ============================================

type KBView = 'home' | 'collection' | 'article' | 'search';

// ============================================
// COMPONENT
// ============================================

export interface KnowledgeBaseProps {
  /** Organization slug */
  orgSlug: string;
  /** Layout style */
  layout?: KBLayout;
  /** Show search box */
  showSearch?: boolean;
  /** Custom logo URL */
  logoUrl?: string;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Primary color override */
  primaryColor?: string;
  /** Callback when article is viewed */
  onArticleView?: (article: KBArticle) => void;
  /** Custom content renderer for articles */
  renderArticleContent?: (content: string) => React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function KnowledgeBase({
  orgSlug,
  layout = KBLayout.CARDS,
  showSearch = true,
  logoUrl,
  title,
  subtitle,
  primaryColor,
  onArticleView,
  renderArticleContent,
  className = '',
  style = {},
}: KnowledgeBaseProps): React.ReactElement {
  const {
    organization,
    settings,
    collections,
    recentArticles,
    isLoading,
    isInitialized,
    error,
  } = useKnowledgeBase();

  const [view, setView] = useState<KBView>('home');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [hoveredCollection, setHoveredCollection] = useState<number | null>(null);
  const [hoveredArticle, setHoveredArticle] = useState<number | null>(null);

  // Navigation handlers
  const handleCollectionClick = useCallback((collection: KBCollection) => {
    setSelectedCollection(collection.slug);
    setView('collection');
  }, []);

  const handleArticleClick = useCallback((article: KBArticle) => {
    setSelectedArticle(article.slug);
    setView('article');
    onArticleView?.(article);
  }, [onArticleView]);

  const handleSearchResultSelect = useCallback((result: KBSearchResult) => {
    setSelectedArticle(result.slug);
    setView('article');
  }, []);

  const handleHomeClick = useCallback(() => {
    setSelectedCollection(null);
    setSelectedArticle(null);
    setView('home');
  }, []);

  const handleCollectionBack = useCallback((collectionSlug: string) => {
    setSelectedCollection(collectionSlug);
    setSelectedArticle(null);
    setView('collection');
  }, []);

  // Display values
  const displayTitle = title || settings?.title || organization?.name || 'Help Center';
  const displaySubtitle = subtitle || settings?.subtitle || 'How can we help you?';
  const displayLogo = logoUrl || settings?.logoUrl;

  if (isLoading && !isInitialized) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  // Render collection view
  if (view === 'collection' && selectedCollection) {
    return (
      <div style={{ ...styles.container, ...style }} className={`txl-knowledge-base ${className}`}>
        <CollectionView
          collectionSlug={selectedCollection}
          onArticleClick={handleArticleClick}
          onHomeClick={handleHomeClick}
        />
      </div>
    );
  }

  // Render article view
  if (view === 'article' && selectedArticle) {
    return (
      <div style={{ ...styles.container, ...style }} className={`txl-knowledge-base ${className}`}>
        <ArticleView
          articleSlug={selectedArticle}
          renderContent={renderArticleContent}
          onCollectionClick={handleCollectionBack}
          onHomeClick={handleHomeClick}
          showFeedback={settings?.feedbackEnabled ?? true}
        />
      </div>
    );
  }

  // Render home view
  return (
    <div style={{ ...styles.container, ...style }} className={`txl-knowledge-base ${className}`}>
      {/* Header */}
      <div
        style={{
          ...styles.header,
          ...(primaryColor
            ? { backgroundColor: `${primaryColor}10` }
            : {}),
        }}
      >
        {displayLogo && (
          <img src={displayLogo} alt={displayTitle} style={styles.logo} />
        )}
        <h1 style={styles.title}>{displayTitle}</h1>
        <p style={styles.subtitle}>{displaySubtitle}</p>

        {showSearch && (settings?.searchEnabled ?? true) && (
          <div style={styles.searchWrapper}>
            <SearchBox
              placeholder="Search for articles..."
              onResultSelect={handleSearchResultSelect}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Collections */}
        {collections.length > 0 && (
          <>
            <h2 style={styles.sectionTitle}>Browse by topic</h2>
            <div style={styles.collectionsGrid}>
              {collections.map((collection, index) => (
                <div
                  key={collection.id}
                  style={{
                    ...styles.collectionCard,
                    ...(hoveredCollection === index ? styles.collectionCardHover : {}),
                  }}
                  onClick={() => handleCollectionClick(collection)}
                  onMouseEnter={() => setHoveredCollection(index)}
                  onMouseLeave={() => setHoveredCollection(null)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCollectionClick(collection);
                  }}
                >
                  {collection.icon && (
                    <div style={styles.collectionIcon}>{collection.icon}</div>
                  )}
                  <div style={styles.collectionName}>{collection.name}</div>
                  {collection.description && (
                    <div style={styles.collectionDescription}>
                      {collection.description}
                    </div>
                  )}
                  {collection.articleCount !== undefined && (
                    <div style={styles.collectionCount}>
                      {collection.articleCount} article
                      {collection.articleCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <>
            <h2 style={styles.sectionTitle}>Recent articles</h2>
            <div style={styles.articlesList}>
              {recentArticles.map((article, index) => (
                <div
                  key={article.id}
                  style={{
                    ...styles.articleItem,
                    ...(hoveredArticle === index ? styles.articleItemHover : {}),
                  }}
                  onClick={() => handleArticleClick(article)}
                  onMouseEnter={() => setHoveredArticle(index)}
                  onMouseLeave={() => setHoveredArticle(null)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleArticleClick(article);
                  }}
                >
                  <span style={styles.articleTitle}>{article.title}</span>
                  {article.collectionSlug && (
                    <span style={styles.articleCollection}>
                      {article.collectionSlug}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
