'use client';

/**
 * ArticleView
 *
 * Component for displaying a knowledge base article.
 *
 * Note: Article content is rendered using dangerouslySetInnerHTML because it contains
 * HTML from the knowledge base CMS. The content is created by organization admins
 * and served from the trusted Transactional API. For additional security, consider
 * adding DOMPurify sanitization in production deployments.
 */

import React, { useState, useCallback } from 'react';
import { useArticle } from '../hooks';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    maxWidth: '800px',
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
  },
  breadcrumbSeparator: {
    color: 'var(--txl-muted-foreground)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--txl-foreground)',
    lineHeight: '1.2',
    marginBottom: '12px',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
  },
  content: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: 'var(--txl-foreground)',
  },
  feedback: {
    marginTop: '48px',
    padding: '24px',
    borderRadius: 'var(--txl-radius-lg)',
    border: '1px solid var(--txl-border)',
    backgroundColor: 'var(--txl-muted)',
    textAlign: 'center' as const,
  },
  feedbackTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--txl-foreground)',
    marginBottom: '12px',
  },
  feedbackButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  feedbackButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    border: '1px solid var(--txl-border)',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-background)',
    color: 'var(--txl-foreground)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 150ms ease, border-color 150ms ease',
  },
  feedbackButtonActive: {
    borderColor: 'var(--txl-primary)',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
  },
  feedbackTextarea: {
    width: '100%',
    minHeight: '80px',
    padding: '12px',
    border: '1px solid var(--txl-border)',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-background)',
    color: 'var(--txl-foreground)',
    fontSize: '14px',
    resize: 'vertical' as const,
    outline: 'none',
    marginBottom: '12px',
    fontFamily: 'var(--txl-font-family)',
  },
  feedbackSubmit: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
  },
  feedbackThanks: {
    fontSize: '14px',
    color: 'var(--txl-success)',
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
  notFound: {
    padding: '48px',
    textAlign: 'center' as const,
  },
  notFoundTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    marginBottom: '8px',
  },
  notFoundText: {
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
  },
};

// ============================================
// ICONS
// ============================================

function ThumbsUpIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function ThumbsDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

// ============================================
// UTILITIES
// ============================================

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================
// COMPONENT
// ============================================

export interface ArticleViewProps {
  /** Article slug to display */
  articleSlug: string;
  /** Show feedback section */
  showFeedback?: boolean;
  /** Show breadcrumb navigation */
  showBreadcrumb?: boolean;
  /** Show article metadata */
  showMeta?: boolean;
  /** Custom content renderer (use this instead of default HTML rendering for added security) */
  renderContent?: (content: string) => React.ReactNode;
  /** Callback when collection is clicked */
  onCollectionClick?: (collectionSlug: string) => void;
  /** Callback when home is clicked */
  onHomeClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function ArticleView({
  articleSlug,
  showFeedback = true,
  showBreadcrumb = true,
  showMeta = true,
  renderContent,
  onCollectionClick,
  onHomeClick,
  className = '',
  style = {},
}: ArticleViewProps): React.ReactElement {
  const { article, isLoading, error, submitFeedback } = useArticle(articleSlug);

  const [feedbackState, setFeedbackState] = useState<'idle' | 'helpful' | 'notHelpful' | 'submitted'>('idle');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = useCallback((isHelpful: boolean) => {
    setFeedbackState(isHelpful ? 'helpful' : 'notHelpful');
  }, []);

  const handleSubmitFeedback = useCallback(async () => {
    if (feedbackState === 'idle' || feedbackState === 'submitted') return;

    setIsSubmitting(true);
    try {
      await submitFeedback(feedbackState === 'helpful', feedbackComment);
      setFeedbackState('submitted');
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  }, [feedbackState, feedbackComment, submitFeedback]);

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

  if (!article) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.notFound}>
          <div style={styles.notFoundTitle}>Article not found</div>
          <div style={styles.notFoundText}>
            The article you're looking for doesn't exist or has been removed.
          </div>
        </div>
      </div>
    );
  }

  // Render content - prefer custom renderer if provided
  const contentElement = article.content ? (
    renderContent ? (
      renderContent(article.content)
    ) : (
      // Default: render as HTML from trusted KB source
      // For additional security, wrap with DOMPurify.sanitize() in production
      <div
        style={styles.content}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: article.content }}
        className="txl-article-content"
      />
    )
  ) : null;

  return (
    <div style={{ ...styles.container, ...style }} className={`txl-article-view ${className}`}>
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <nav style={styles.breadcrumb}>
          <button
            type="button"
            style={{ ...styles.breadcrumbLink, border: 'none', background: 'none', padding: 0 }}
            onClick={onHomeClick}
          >
            Home
          </button>
          <span style={styles.breadcrumbSeparator}>/</span>
          {article.collectionSlug && article.collectionName && (
            <>
              <button
                type="button"
                style={{ ...styles.breadcrumbLink, border: 'none', background: 'none', padding: 0 }}
                onClick={() => onCollectionClick?.(article.collectionSlug!)}
              >
                {article.collectionName}
              </button>
              <span style={styles.breadcrumbSeparator}>/</span>
            </>
          )}
          <span>{article.title}</span>
        </nav>
      )}

      {/* Title */}
      <h1 style={styles.title}>{article.title}</h1>

      {/* Meta */}
      {showMeta && article.publishedAt && (
        <div style={styles.meta}>
          <span>Updated {formatDate(article.publishedAt)}</span>
        </div>
      )}

      {/* Content */}
      {contentElement}

      {/* Feedback */}
      {showFeedback && (
        <div style={styles.feedback}>
          {feedbackState === 'submitted' ? (
            <div style={styles.feedbackThanks}>
              Thanks for your feedback!
            </div>
          ) : (
            <>
              <div style={styles.feedbackTitle}>Was this article helpful?</div>
              <div style={styles.feedbackButtons}>
                <button
                  type="button"
                  style={{
                    ...styles.feedbackButton,
                    ...(feedbackState === 'helpful' ? styles.feedbackButtonActive : {}),
                  }}
                  onClick={() => handleFeedback(true)}
                >
                  <ThumbsUpIcon /> Yes
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.feedbackButton,
                    ...(feedbackState === 'notHelpful' ? styles.feedbackButtonActive : {}),
                  }}
                  onClick={() => handleFeedback(false)}
                >
                  <ThumbsDownIcon /> No
                </button>
              </div>

              {(feedbackState === 'helpful' || feedbackState === 'notHelpful') && (
                <>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder={
                      feedbackState === 'helpful'
                        ? 'What did you find most helpful? (optional)'
                        : 'How can we improve this article? (optional)'
                    }
                    style={styles.feedbackTextarea}
                  />
                  <button
                    type="button"
                    style={{
                      ...styles.feedbackSubmit,
                      opacity: isSubmitting ? 0.5 : 1,
                    }}
                    onClick={handleSubmitFeedback}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit feedback'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
