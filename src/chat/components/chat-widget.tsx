'use client';

/**
 * ChatWidget
 *
 * The main chat widget component that combines all chat UI elements.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useChat, useConversations } from '../hooks';
import { ChatWidgetState, ComponentSize } from '../../constants';
import { WidgetLauncher } from './widget-launcher';
import { MessageList } from './message-list';
import { ConversationView } from './conversation-view';
import { ChatConversation } from '../context';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    position: 'fixed' as const,
    zIndex: 9998,
    display: 'flex',
    flexDirection: 'column' as const,
    width: '380px',
    height: '600px',
    maxHeight: 'calc(100vh - 100px)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--txl-border)',
    backgroundColor: 'var(--txl-background)',
    fontFamily: 'var(--txl-font-family)',
  },
  containerBottomRight: {
    bottom: '90px',
    right: '20px',
  },
  containerBottomLeft: {
    bottom: '90px',
    left: '20px',
  },
  header: {
    padding: '20px',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  headerSubtitle: {
    fontSize: '14px',
    opacity: 0.9,
  },
  closeButton: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'inherit',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  welcomeSection: {
    padding: '20px',
    borderBottom: '1px solid var(--txl-border)',
  },
  welcomeTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    marginBottom: '4px',
  },
  welcomeText: {
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
    lineHeight: '1.5',
  },
  replyTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    fontSize: '13px',
    color: 'var(--txl-muted-foreground)',
  },
  replyTimeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#22C55E',
  },
  conversationsList: {
    flex: 1,
    overflowY: 'auto' as const,
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--txl-border)',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
    backgroundColor: 'var(--txl-background)',
  },
  conversationItemHover: {
    backgroundColor: 'var(--txl-muted)',
  },
  conversationAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--txl-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--txl-muted-foreground)',
    flexShrink: 0,
  },
  conversationContent: {
    flex: 1,
    minWidth: 0,
  },
  conversationTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    marginBottom: '2px',
  },
  conversationPreview: {
    fontSize: '13px',
    color: 'var(--txl-muted-foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  conversationTime: {
    fontSize: '12px',
    color: 'var(--txl-muted-foreground)',
    flexShrink: 0,
  },
  unreadBadge: {
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newConversationButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: 'calc(100% - 32px)',
    margin: '16px',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
  },
  newConversationView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  inputContainer: {
    padding: '16px 20px',
    borderTop: '1px solid var(--txl-border)',
    backgroundColor: 'var(--txl-card)',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    backgroundColor: 'var(--txl-muted)',
    borderRadius: '20px',
    padding: '8px 8px 8px 16px',
  },
  textarea: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    resize: 'none' as const,
    outline: 'none',
    fontSize: '14px',
    lineHeight: '1.4',
    color: 'var(--txl-foreground)',
    maxHeight: '120px',
    minHeight: '24px',
    fontFamily: 'var(--txl-font-family)',
  },
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
    flexShrink: 0,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    marginBottom: '16px',
    color: 'var(--txl-muted-foreground)',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--txl-muted-foreground)',
    lineHeight: '1.5',
  },
};

// ============================================
// ICONS
// ============================================

function CloseIcon({ size = 18 }: { size?: number }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon({ size = 18 }: { size?: number }) {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ============================================
// UTILITIES
// ============================================

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getReplyTimeText(replyTime?: string): string {
  switch (replyTime) {
    case 'few_minutes':
      return 'Usually replies in a few minutes';
    case 'few_hours':
      return 'Usually replies in a few hours';
    case 'one_day':
      return 'Usually replies in a day';
    default:
      return 'We\'ll reply as soon as possible';
  }
}

// ============================================
// VIEWS
// ============================================

type WidgetView = 'home' | 'conversations' | 'conversation' | 'new';

// ============================================
// COMPONENT
// ============================================

export interface ChatWidgetProps {
  /** Inbox ID - required */
  inboxId: string;
  /** Position of the widget */
  position?: 'bottom-right' | 'bottom-left';
  /** Primary color (overrides theme) */
  primaryColor?: string;
  /** Widget title */
  title?: string;
  /** Widget subtitle */
  subtitle?: string;
  /** Launcher text */
  launcherText?: string;
  /** Launcher size */
  launcherSize?: ComponentSize;
  /** Hide the launcher (for custom launchers) */
  hideLauncher?: boolean;
  /** Additional CSS class for the widget panel */
  className?: string;
  /** Additional inline styles for the widget panel */
  style?: React.CSSProperties;
}

export function ChatWidget({
  inboxId,
  position = 'bottom-right',
  primaryColor,
  title,
  subtitle,
  launcherText,
  launcherSize = ComponentSize.MD,
  hideLauncher = false,
  className = '',
  style = {},
}: ChatWidgetProps): React.ReactElement | null {
  const {
    isOpen,
    close,
    visitor,
    isInitialized,
    error,
  } = useChat();

  const {
    conversations,
    activeConversationId,
    loadConversations,
    createConversation,
    selectConversation,
    clearActiveConversation,
  } = useConversations();

  const [view, setView] = useState<WidgetView>('home');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hoveredConvo, setHoveredConvo] = useState<number | null>(null);

  // Get config from context
  const config = useChat().visitor ? (window as any).__txl_chat_config : null;

  // Load conversations when widget opens
  useEffect(() => {
    if (isOpen && isInitialized) {
      loadConversations();
    }
  }, [isOpen, isInitialized, loadConversations]);

  // Update view based on active conversation
  useEffect(() => {
    if (activeConversationId) {
      setView('conversation');
    }
  }, [activeConversationId]);

  // Handle creating a new conversation
  const handleCreateConversation = useCallback(async () => {
    const message = newMessage.trim();
    if (!message || isSending) return;

    setIsSending(true);

    try {
      await createConversation(message);
      setNewMessage('');
      setView('conversation');
    } catch {
      // Error handled by provider
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, createConversation]);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback(
    (convo: ChatConversation) => {
      selectConversation(convo.id);
      setView('conversation');
    },
    [selectConversation]
  );

  // Handle going back
  const handleBack = useCallback(() => {
    clearActiveConversation();
    setView(conversations.length > 0 ? 'conversations' : 'home');
  }, [clearActiveConversation, conversations.length]);

  // Handle starting a new conversation
  const handleStartNew = useCallback(() => {
    clearActiveConversation();
    setView('new');
  }, [clearActiveConversation]);

  // Position styles
  const positionStyles =
    position === 'bottom-left'
      ? styles.containerBottomLeft
      : styles.containerBottomRight;

  // Render widget panel
  const renderPanel = () => {
    if (!isOpen) return null;

    const displayTitle = title || 'Chat with us';
    const displaySubtitle = subtitle || 'We\'re here to help';

    return (
      <div
        style={{
          ...styles.container,
          ...positionStyles,
          ...style,
        }}
        className={`txl-chat-widget txl-animate-scale-in ${className}`}
        role="dialog"
        aria-label="Chat widget"
      >
        {/* Header */}
        <div
          style={{
            ...styles.header,
            backgroundColor: primaryColor || 'var(--txl-primary)',
            position: 'relative',
          }}
        >
          <div style={styles.headerTitle}>{displayTitle}</div>
          <div style={styles.headerSubtitle}>{displaySubtitle}</div>
          <button
            type="button"
            style={styles.closeButton}
            onClick={close}
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Home View */}
          {view === 'home' && (
            <>
              <div style={styles.welcomeSection}>
                <div style={styles.welcomeTitle}>Hi there!</div>
                <div style={styles.welcomeText}>
                  How can we help you today? Start a conversation and we'll get back to you as soon as possible.
                </div>
                <div style={styles.replyTime}>
                  <span style={styles.replyTimeDot} />
                  <span>Usually replies in a few minutes</span>
                </div>
              </div>

              {conversations.length > 0 ? (
                <>
                  <div style={styles.conversationsList}>
                    {conversations.slice(0, 3).map((convo) => (
                      <div
                        key={convo.id}
                        style={{
                          ...styles.conversationItem,
                          ...(hoveredConvo === convo.id ? styles.conversationItemHover : {}),
                        }}
                        onClick={() => handleSelectConversation(convo)}
                        onMouseEnter={() => setHoveredConvo(convo.id)}
                        onMouseLeave={() => setHoveredConvo(null)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSelectConversation(convo);
                        }}
                      >
                        <div style={styles.conversationAvatar}>S</div>
                        <div style={styles.conversationContent}>
                          <div style={styles.conversationTitle}>
                            {convo.subject || 'Conversation'}
                          </div>
                          <div style={styles.conversationPreview}>
                            {convo.preview || 'No messages'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={styles.conversationTime}>
                            {formatTimeAgo(convo.lastMessageAt)}
                          </span>
                          {convo.unreadCount > 0 && (
                            <span style={styles.unreadBadge}>{convo.unreadCount}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    style={styles.newConversationButton}
                    onClick={handleStartNew}
                  >
                    <PlusIcon />
                    Start new conversation
                  </button>
                </>
              ) : (
                <div style={styles.newConversationView}>
                  <div style={{ flex: 1 }} />
                  <div style={styles.inputContainer}>
                    <div style={styles.inputWrapper}>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCreateConversation();
                          }
                        }}
                        placeholder="Type your message..."
                        style={styles.textarea}
                        rows={1}
                        disabled={isSending}
                      />
                      <button
                        type="button"
                        onClick={handleCreateConversation}
                        style={{
                          ...styles.sendButton,
                          opacity: newMessage.trim() && !isSending ? 1 : 0.5,
                        }}
                        disabled={!newMessage.trim() || isSending}
                      >
                        <SendIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Conversations List View */}
          {view === 'conversations' && (
            <>
              <div style={styles.conversationsList}>
                {conversations.map((convo) => (
                  <div
                    key={convo.id}
                    style={{
                      ...styles.conversationItem,
                      ...(hoveredConvo === convo.id ? styles.conversationItemHover : {}),
                    }}
                    onClick={() => handleSelectConversation(convo)}
                    onMouseEnter={() => setHoveredConvo(convo.id)}
                    onMouseLeave={() => setHoveredConvo(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectConversation(convo);
                    }}
                  >
                    <div style={styles.conversationAvatar}>S</div>
                    <div style={styles.conversationContent}>
                      <div style={styles.conversationTitle}>
                        {convo.subject || 'Conversation'}
                      </div>
                      <div style={styles.conversationPreview}>
                        {convo.preview || 'No messages'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={styles.conversationTime}>
                        {formatTimeAgo(convo.lastMessageAt)}
                      </span>
                      {convo.unreadCount > 0 && (
                        <span style={styles.unreadBadge}>{convo.unreadCount}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                style={styles.newConversationButton}
                onClick={handleStartNew}
              >
                <PlusIcon />
                Start new conversation
              </button>
            </>
          )}

          {/* Single Conversation View */}
          {view === 'conversation' && activeConversationId && (
            <ConversationView
              conversationId={activeConversationId}
              onBack={handleBack}
              showBack
            />
          )}

          {/* New Conversation View */}
          {view === 'new' && (
            <div style={styles.newConversationView}>
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <ChatIcon />
                </div>
                <div style={styles.emptyText}>
                  Start a new conversation. We're here to help!
                </div>
              </div>
              <div style={styles.inputContainer}>
                <div style={styles.inputWrapper}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateConversation();
                      }
                    }}
                    placeholder="Type your message..."
                    style={styles.textarea}
                    rows={1}
                    disabled={isSending}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateConversation}
                    style={{
                      ...styles.sendButton,
                      opacity: newMessage.trim() && !isSending ? 1 : 0.5,
                    }}
                    disabled={!newMessage.trim() || isSending}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      {renderPanel()}
      {!hideLauncher && (
        <WidgetLauncher
          position={position}
          size={launcherSize}
          primaryColor={primaryColor}
          text={launcherText}
        />
      )}
    </>
  );
}
