'use client';

/**
 * ConversationView
 *
 * Displays a single conversation with message input.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useConversation } from '../hooks';
import { MessageList } from './message-list';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    backgroundColor: 'var(--txl-background)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--txl-border)',
    backgroundColor: 'var(--txl-card)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--txl-foreground)',
    transition: 'background-color 150ms ease',
  },
  headerTitle: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--txl-foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  headerSubtitle: {
    fontSize: '12px',
    color: 'var(--txl-muted-foreground)',
  },
  messagesContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  inputContainer: {
    padding: '12px 16px',
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
    transition: 'opacity 150ms ease, transform 150ms ease',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

// ============================================
// ICONS
// ============================================

function BackIcon({ size = 20 }: { size?: number }) {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

// ============================================
// COMPONENT
// ============================================

export interface ConversationViewProps {
  /** Conversation ID to display */
  conversationId: number;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Show back button */
  showBack?: boolean;
  /** Header title (defaults to conversation subject or 'Conversation') */
  title?: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Show avatars in message list */
  showAvatars?: boolean;
  /** Show timestamps in message list */
  showTimestamps?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function ConversationView({
  conversationId,
  onBack,
  showBack = true,
  title,
  placeholder = 'Type a message...',
  showAvatars = true,
  showTimestamps = true,
  className = '',
  style = {},
}: ConversationViewProps): React.ReactElement {
  const {
    conversation,
    messages,
    isLoading,
    loadMessages,
    sendMessage,
    markAsRead,
  } = useConversation(conversationId);

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
    markAsRead();
  }, [conversationId]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSend = useCallback(async () => {
    const message = inputValue.trim();
    if (!message || isSending) return;

    setIsSending(true);
    setInputValue('');

    try {
      await sendMessage(message);
    } catch {
      // Restore message on error
      setInputValue(message);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const displayTitle = title || conversation?.subject || 'Conversation';
  const canSend = inputValue.trim().length > 0 && !isSending;

  return (
    <div style={{ ...styles.container, ...style }} className={`txl-conversation-view ${className}`}>
      {/* Header */}
      <div style={styles.header}>
        {showBack && onBack && (
          <button
            type="button"
            style={styles.backButton}
            onClick={onBack}
            aria-label="Go back"
          >
            <BackIcon />
          </button>
        )}
        <div>
          <div style={styles.headerTitle}>{displayTitle}</div>
          {conversation && (
            <div style={styles.headerSubtitle}>
              {conversation.status === 'resolved' ? 'Resolved' : 'Active'}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        <MessageList
          messages={messages}
          isLoading={isLoading}
          showAvatars={showAvatars}
          showTimestamps={showTimestamps}
          emptyMessage="Send a message to start the conversation"
          style={{ height: '100%' }}
        />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={styles.textarea}
            rows={1}
            disabled={isSending}
            aria-label="Message input"
          />
          <button
            type="button"
            onClick={handleSend}
            style={{
              ...styles.sendButton,
              ...(canSend ? {} : styles.sendButtonDisabled),
            }}
            disabled={!canSend}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
