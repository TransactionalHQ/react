'use client';

/**
 * CollectionView
 *
 * Component for displaying a knowledge base collection with its articles.
 */

import React from 'react';
import { useCollection } from '../hooks';
import { KBArticle } from '../context';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'var(--txl-font-family)',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
  },
  breadcrumbLink: {
    color: 'var(--txl-primary)',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
  },
  breadcrumbSeparator: {
    color: 'var(--txl-muted-foreground)',
  },
  header: {
    marginBottom: '32px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--txl-foreground)',
    marginBottom: '8px',
  },
  description: {
    fontSize: '16px',
    color: 'var(--txl-muted-foreground)',
    lineHeight: '1.5',
  },
  articleCount: {
    marginTop: '8px',
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
  },
  articlesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  articleItem: {
    display: 'block',
    padding: '16px 20px',
    borderRadius: 'var(--txl-radius-lg)',
    border: '1px solid var(--txl-border)',
    backgroundColor: 'var(--txl-card)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  },
  articleItemHover: {
    borderColor: 'var(--txl-primary)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  articleTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--txl-foreground)',
    marginBottom: '4px',
  },
  articleExcerpt: {
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid var(--txl-muted)',
    borderTopColor: 'var(--txl-primary)',
    borderRadius: '50%',
    animation: 'txl-spin 1s linear infinite',
  },
  error: {
    padding: '24px',
    textAlign: 'center' as const,
    color: 'var(--txl-destructive)',
  },
  empty: {
    padding: '48px',
    textAlign: 'center' as const,
    color: 'var(--txl-muted-foreground)',
  },
};

// ============================================
// COMPONENT
// ============================================

export interface CollectionViewProps {
  /** Collection slug to display */
  collectionSlug: string;
  /** Show breadcrumb navigation */
  showBreadcrumb?: boolean;
  /** Callback when an article is clicked */
  onArticleClick?: (article: KBArticle) => void;
  /** Callback when home is clicked */
  onHomeClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function CollectionView({
  collectionSlug,
  showBreadcrumb = true,
  onArticleClick,
  onHomeClick,
  className = '',
  style = {},
}: CollectionViewProps): React.ReactElement {
  const { collection, articles, isLoading, error } = useCollection(collectionSlug);

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (isLoading) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.empty}>Collection not found</div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...style }} className={`txl-collection-view ${className}`}>
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <nav style={styles.breadcrumb}>
          <button
            type="button"
            style={styles.breadcrumbLink}
            onClick={onHomeClick}
          >
            Home
          </button>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span>{collection.name}</span>
        </nav>
      )}

      {/* Header */}
      <div style={styles.header}>
        {collection.icon && (
          <div style={styles.icon}>{collection.icon}</div>
        )}
        <h1 style={styles.title}>{collection.name}</h1>
        {collection.description && (
          <p style={styles.description}>{collection.description}</p>
        )}
        <div style={styles.articleCount}>
          {articles.length} article{articles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <div style={styles.empty}>No articles in this collection yet.</div>
      ) : (
        <div style={styles.articlesList}>
          {articles.map((article, index) => (
            <div
              key={article.id}
              style={{
                ...styles.articleItem,
                ...(hoveredIndex === index ? styles.articleItemHover : {}),
              }}
              onClick={() => onArticleClick?.(article)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onArticleClick?.(article);
              }}
            >
              <div style={styles.articleTitle}>{article.title}</div>
              {article.excerpt && (
                <div style={styles.articleExcerpt}>{article.excerpt}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
