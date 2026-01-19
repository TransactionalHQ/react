'use client';

/**
 * Chat Hooks
 *
 * React hooks for interacting with the chat widget.
 */

import { useContext, useCallback, useMemo } from 'react';
import { ChatContext, ChatContextValue, ChatMessage, ChatConversation } from './context';
import { ChatWidgetState } from '../constants';

/**
 * Hook to access the full chat context
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

/**
 * Main hook for chat widget control
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle, unreadCount, identify } = useChat();
 *
 * // Open widget
 * open();
 *
 * // Identify user
 * identify('user-123', { email: 'user@example.com', name: 'John' });
 * ```
 */
export function useChat() {
  const context = useChatContext();

  return {
    // Widget state
    isOpen: context.widgetState === ChatWidgetState.OPEN,
    isClosed: context.widgetState === ChatWidgetState.CLOSED,
    isMinimized: context.widgetState === ChatWidgetState.MINIMIZED,
    widgetState: context.widgetState,

    // Unread count
    unreadCount: context.unreadCount,

    // Visitor info
    visitor: context.visitor,
    isIdentified: context.visitor?.identified ?? false,

    // Loading state
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    error: context.error,

    // Widget controls
    open: context.open,
    close: context.close,
    toggle: context.toggle,

    // Identification
    identify: context.identify,

    // Tracking
    trackPageView: context.trackPageView,
    trackEvent: context.trackEvent,
  };
}

/**
 * Hook for conversation management
 *
 * @example
 * ```tsx
 * const { conversations, activeConversation, createConversation } = useConversations();
 *
 * // Create new conversation
 * await createConversation('Hello, I need help!');
 * ```
 */
export function useConversations() {
  const context = useChatContext();

  const activeConversation = useMemo((): ChatConversation | null => {
    if (!context.activeConversationId) return null;
    return (
      context.conversations.find((c) => c.id === context.activeConversationId) ?? null
    );
  }, [context.conversations, context.activeConversationId]);

  return {
    // Conversation list
    conversations: context.conversations,
    activeConversation,
    activeConversationId: context.activeConversationId,

    // Loading state
    isLoading: context.isLoading,

    // Actions
    loadConversations: context.loadConversations,
    createConversation: context.createConversation,
    selectConversation: context.selectConversation,
    clearActiveConversation: context.clearActiveConversation,
  };
}

/**
 * Hook for message management within the active conversation
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading } = useMessages();
 *
 * await sendMessage('Thanks for the help!');
 * ```
 */
export function useMessages() {
  const context = useChatContext();

  const sendMessageIfActive = useCallback(
    async (message: string) => {
      if (!context.activeConversationId) {
        throw new Error('No active conversation. Select or create a conversation first.');
      }
      return context.sendMessage(message);
    },
    [context.activeConversationId, context.sendMessage]
  );

  return {
    // Messages
    messages: context.messages,

    // Active conversation
    conversationId: context.activeConversationId,

    // Loading state
    isLoading: context.isLoading,

    // Actions
    loadMessages: context.loadMessages,
    sendMessage: sendMessageIfActive,
    markAsRead: context.markAsRead,
  };
}

/**
 * Hook for a specific conversation
 *
 * @param conversationId - The conversation ID to load
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading } = useConversation(123);
 * ```
 */
export function useConversation(conversationId?: number) {
  const context = useChatContext();

  // Auto-select conversation when ID changes
  const selectAndLoad = useCallback(async () => {
    if (!conversationId) return;

    if (context.activeConversationId !== conversationId) {
      context.selectConversation(conversationId);
    }

    await context.loadMessages(conversationId);
  }, [conversationId, context.activeConversationId, context.selectConversation, context.loadMessages]);

  const conversation = useMemo((): ChatConversation | null => {
    if (!conversationId) return null;
    return context.conversations.find((c) => c.id === conversationId) ?? null;
  }, [context.conversations, conversationId]);

  const isActive = context.activeConversationId === conversationId;

  const sendMessage = useCallback(
    async (message: string) => {
      if (!conversationId) {
        throw new Error('No conversation ID provided');
      }
      if (!isActive) {
        context.selectConversation(conversationId);
      }
      return context.sendMessage(message);
    },
    [conversationId, isActive, context.selectConversation, context.sendMessage]
  );

  return {
    conversation,
    messages: isActive ? context.messages : [],
    isActive,
    isLoading: context.isLoading,
    loadMessages: selectAndLoad,
    sendMessage,
    markAsRead: () => conversationId && context.markAsRead(conversationId),
  };
}

/**
 * Hook to track visitor activity
 *
 * @example
 * ```tsx
 * const { trackPageView, trackEvent } = useTracking();
 *
 * // Track page view
 * trackPageView();
 *
 * // Track custom event
 * trackEvent('button_clicked', { buttonId: 'cta-hero' });
 * ```
 */
export function useTracking() {
  const context = useChatContext();

  return {
    trackPageView: context.trackPageView,
    trackEvent: context.trackEvent,
    visitor: context.visitor,
  };
}
