'use client';

/**
 * MessageList
 *
 * Displays the list of messages in a conversation.
 */

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../context';
import { MessageSenderType, MessageType } from '../../constants';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '16px',
    overflowY: 'auto' as const,
    flex: 1,
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  messageRowVisitor: {
    flexDirection: 'row-reverse' as const,
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--txl-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--txl-muted-foreground)',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.4',
    wordBreak: 'break-word' as const,
  },
  bubbleVisitor: {
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    borderBottomRightRadius: '4px',
  },
  bubbleAgent: {
    backgroundColor: 'var(--txl-muted)',
    color: 'var(--txl-foreground)',
    borderBottomLeftRadius: '4px',
  },
  bubbleSystem: {
    backgroundColor: 'transparent',
    color: 'var(--txl-muted-foreground)',
    textAlign: 'center' as const,
    fontSize: '12px',
    maxWidth: '100%',
    padding: '8px',
  },
  timestamp: {
    fontSize: '11px',
    color: 'var(--txl-muted-foreground)',
    marginTop: '4px',
    paddingLeft: '36px',
    paddingRight: '36px',
  },
  timestampVisitor: {
    textAlign: 'right' as const,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '24px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    marginBottom: '16px',
    color: 'var(--txl-muted-foreground)',
  },
  emptyText: {
    color: 'var(--txl-muted-foreground)',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid var(--txl-muted)',
    borderTopColor: 'var(--txl-primary)',
    borderRadius: '50%',
    animation: 'txl-spin 1s linear infinite',
  },
};

// ============================================
// UTILITIES
// ============================================

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  } else {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }
}

function shouldShowDate(
  message: ChatMessage,
  prevMessage: ChatMessage | undefined
): boolean {
  if (!prevMessage) return true;

  const date = new Date(message.createdAt).toDateString();
  const prevDate = new Date(prevMessage.createdAt).toDateString();

  return date !== prevDate;
}

// ============================================
// ICONS
// ============================================

function ChatBubbleIcon() {
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
// COMPONENT
// ============================================

export interface MessageListProps {
  /** Messages to display */
  messages: ChatMessage[];
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Show avatars */
  showAvatars?: boolean;
  /** Show timestamps */
  showTimestamps?: boolean;
  /** Agent name for avatar */
  agentName?: string;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function MessageList({
  messages,
  isLoading = false,
  emptyMessage = 'No messages yet. Start a conversation!',
  showAvatars = true,
  showTimestamps = true,
  agentName = 'Support',
  className = '',
  style = {},
}: MessageListProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading && messages.length === 0) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>
            <ChatBubbleIcon />
          </div>
          <p style={styles.emptyText}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, ...style }}
      className={`txl-message-list ${className}`}
    >
      {messages.map((message, index) => {
        const prevMessage = messages[index - 1];
        const isVisitor = message.senderType === MessageSenderType.VISITOR;
        const isSystem = message.type === MessageType.SYSTEM;
        const showDate = shouldShowDate(message, prevMessage);

        return (
          <React.Fragment key={message.id}>
            {showDate && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'var(--txl-muted-foreground)',
                  padding: '8px 0',
                }}
              >
                {formatDate(message.createdAt)}
              </div>
            )}

            {isSystem ? (
              <div style={{ ...styles.bubble, ...styles.bubbleSystem }}>
                {message.content}
              </div>
            ) : (
              <div
                style={{
                  ...styles.messageRow,
                  ...(isVisitor ? styles.messageRowVisitor : {}),
                }}
              >
                {showAvatars && !isVisitor && (
                  <div style={styles.avatar}>{agentName.charAt(0).toUpperCase()}</div>
                )}

                <div
                  style={{
                    ...styles.bubble,
                    ...(isVisitor ? styles.bubbleVisitor : styles.bubbleAgent),
                  }}
                >
                  {message.content}
                </div>

                {showAvatars && isVisitor && <div style={{ width: '28px' }} />}
              </div>
            )}

            {showTimestamps && !isSystem && (
              <div
                style={{
                  ...styles.timestamp,
                  ...(isVisitor ? styles.timestampVisitor : {}),
                }}
              >
                {formatTime(message.createdAt)}
              </div>
            )}
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
