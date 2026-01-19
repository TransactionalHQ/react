'use client';

/**
 * ChatProvider
 *
 * Provider component for the chat widget functionality.
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { ChatWidgetState } from '../constants';
import { useTransactional } from '../provider';
import {
  getVisitorUuid,
  storeVisitorUuid,
  getWidgetState,
  storeWidgetState,
  getOrCreateSessionId,
} from '../shared/storage';
import { createChatApiClient, ChatApiClient } from './api-client';
import {
  ChatContext,
  ChatContextValue,
  ChatState,
  ChatMessage,
  ChatConversation,
  ChatVisitor,
  ChatConfig,
} from './context';

// ============================================
// STATE MANAGEMENT
// ============================================

type ChatAction =
  | { type: 'SET_WIDGET_STATE'; payload: ChatWidgetState }
  | { type: 'SET_VISITOR'; payload: ChatVisitor }
  | { type: 'SET_CONFIG'; payload: ChatConfig }
  | { type: 'SET_CONVERSATIONS'; payload: ChatConversation[] }
  | { type: 'ADD_CONVERSATION'; payload: ChatConversation }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: number | null }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: ChatState = {
  widgetState: ChatWidgetState.CLOSED,
  visitor: null,
  config: null,
  conversations: [],
  activeConversationId: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isInitialized: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_WIDGET_STATE':
      return { ...state, widgetState: action.payload };
    case 'SET_VISITOR':
      return { ...state, visitor: action.payload };
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload, messages: [] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ============================================
// PROVIDER
// ============================================

export interface ChatProviderProps {
  children: React.ReactNode;
  /** Inbox ID - required */
  inboxId: string;
  /** Auto-initialize on mount */
  autoInit?: boolean;
  /** Default widget state */
  defaultState?: 'open' | 'closed';
  /** Callback when widget opens */
  onOpen?: () => void;
  /** Callback when widget closes */
  onClose?: () => void;
  /** Callback when a new message is received */
  onMessage?: (message: ChatMessage) => void;
}

export function ChatProvider({
  children,
  inboxId,
  autoInit = true,
  defaultState = 'closed',
  onOpen,
  onClose,
  onMessage,
}: ChatProviderProps): React.ReactElement {
  const { httpClient } = useTransactional();
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const apiClientRef = useRef<ChatApiClient | null>(null);
  const initializingRef = useRef(false);

  // Create API client
  const apiClient = useMemo(() => {
    apiClientRef.current = createChatApiClient(httpClient, inboxId);
    return apiClientRef.current;
  }, [httpClient, inboxId]);

  // Initialize widget
  const initialize = useCallback(async () => {
    if (initializingRef.current || state.isInitialized) return;
    initializingRef.current = true;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const visitorUuid = getVisitorUuid();
      const response = await apiClient.init(visitorUuid ?? undefined);

      // Store visitor UUID
      storeVisitorUuid(response.visitor.uuid);

      dispatch({ type: 'SET_VISITOR', payload: response.visitor });
      dispatch({ type: 'SET_CONFIG', payload: response.config });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: response.unreadCount });

      // Restore widget state or use config default
      const savedState = getWidgetState();
      const initialWidgetState =
        savedState === 'open'
          ? ChatWidgetState.OPEN
          : savedState === 'closed'
          ? ChatWidgetState.CLOSED
          : response.config.defaultState === 'open'
          ? ChatWidgetState.OPEN
          : ChatWidgetState.CLOSED;

      dispatch({ type: 'SET_WIDGET_STATE', payload: initialWidgetState });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize chat';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      initializingRef.current = false;
    }
  }, [apiClient, state.isInitialized]);

  // Auto-initialize
  useEffect(() => {
    if (autoInit && !state.isInitialized && !initializingRef.current) {
      initialize();
    }
  }, [autoInit, initialize, state.isInitialized]);

  // Widget controls
  const open = useCallback(() => {
    dispatch({ type: 'SET_WIDGET_STATE', payload: ChatWidgetState.OPEN });
    storeWidgetState('open');
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    dispatch({ type: 'SET_WIDGET_STATE', payload: ChatWidgetState.CLOSED });
    storeWidgetState('closed');
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (state.widgetState === ChatWidgetState.OPEN) {
      close();
    } else {
      open();
    }
  }, [state.widgetState, open, close]);

  // Identify visitor
  const identify = useCallback(
    async (
      userId: string,
      userData?: {
        email?: string;
        name?: string;
        phone?: string;
        avatar?: string;
        [key: string]: unknown;
      }
    ) => {
      if (!state.visitor) {
        throw new Error('Chat not initialized');
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await apiClient.identify(state.visitor.uuid, userId, userData);

        // Update visitor (may have new UUID if merged)
        storeVisitorUuid(response.visitor.uuid);
        dispatch({ type: 'SET_VISITOR', payload: response.visitor });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to identify visitor';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [apiClient, state.visitor]
  );

  // Track page view
  const trackPageView = useCallback(
    async (url?: string, title?: string) => {
      if (!state.visitor) return;

      const sessionId = getOrCreateSessionId();

      try {
        await apiClient.track(state.visitor.uuid, {
          type: 'PAGE_VIEW',
          pageUrl: url ?? (typeof window !== 'undefined' ? window.location.href : undefined),
          pageTitle: title ?? (typeof document !== 'undefined' ? document.title : undefined),
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
          sessionId,
        });
      } catch {
        // Silently fail tracking
      }
    },
    [apiClient, state.visitor]
  );

  // Track custom event
  const trackEvent = useCallback(
    async (eventName: string, properties?: Record<string, unknown>) => {
      if (!state.visitor) return;

      const sessionId = getOrCreateSessionId();

      try {
        await apiClient.track(state.visitor.uuid, {
          type: 'CUSTOM_EVENT',
          eventName,
          properties,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          sessionId,
        });
      } catch {
        // Silently fail tracking
      }
    },
    [apiClient, state.visitor]
  );

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!state.visitor) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await apiClient.getConversations(state.visitor.uuid);
      dispatch({ type: 'SET_CONVERSATIONS', payload: response.conversations });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load conversations';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [apiClient, state.visitor]);

  // Create conversation
  const createConversation = useCallback(
    async (message: string, subject?: string) => {
      if (!state.visitor) {
        throw new Error('Chat not initialized');
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await apiClient.createConversation(
          state.visitor.uuid,
          message,
          subject
        );

        // Add to conversations list
        const newConversation: ChatConversation = {
          id: response.conversation.id,
          status: response.conversation.status as any,
          createdAt: response.conversation.createdAt,
          lastMessageAt: response.conversation.createdAt,
          unreadCount: 0,
          preview: message.substring(0, 100),
          subject,
        };

        dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: response.conversation.id });
        dispatch({ type: 'SET_MESSAGES', payload: [response.message] });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create conversation';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [apiClient, state.visitor]
  );

  // Select conversation
  const selectConversation = useCallback((conversationId: number) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
  }, []);

  // Clear active conversation
  const clearActiveConversation = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: null });
  }, []);

  // Load messages
  const loadMessages = useCallback(
    async (conversationId: number) => {
      if (!state.visitor) return;

      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await apiClient.getMessages(conversationId, state.visitor.uuid);
        dispatch({ type: 'SET_MESSAGES', payload: response.messages });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load messages';
        dispatch({ type: 'SET_ERROR', payload: message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [apiClient, state.visitor]
  );

  // Send message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!state.visitor || !state.activeConversationId) {
        throw new Error('No active conversation');
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await apiClient.sendMessage(
          state.activeConversationId,
          state.visitor.uuid,
          message
        );

        dispatch({ type: 'ADD_MESSAGE', payload: response.message });
        onMessage?.(response.message);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [apiClient, state.visitor, state.activeConversationId, onMessage]
  );

  // Mark as read
  const markAsRead = useCallback(
    async (conversationId: number) => {
      if (!state.visitor) return;

      try {
        await apiClient.markAsRead(conversationId, state.visitor.uuid);

        // Update local unread count
        const conversation = state.conversations.find((c) => c.id === conversationId);
        if (conversation && conversation.unreadCount > 0) {
          const updatedConversations = state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          );
          dispatch({ type: 'SET_CONVERSATIONS', payload: updatedConversations });
          dispatch({
            type: 'SET_UNREAD_COUNT',
            payload: Math.max(0, state.unreadCount - conversation.unreadCount),
          });
        }
      } catch {
        // Silently fail
      }
    },
    [apiClient, state.visitor, state.conversations, state.unreadCount]
  );

  // Context value
  const contextValue = useMemo<ChatContextValue>(
    () => ({
      ...state,
      open,
      close,
      toggle,
      identify,
      trackPageView,
      trackEvent,
      loadConversations,
      createConversation,
      selectConversation,
      clearActiveConversation,
      loadMessages,
      sendMessage,
      markAsRead,
    }),
    [
      state,
      open,
      close,
      toggle,
      identify,
      trackPageView,
      trackEvent,
      loadConversations,
      createConversation,
      selectConversation,
      clearActiveConversation,
      loadMessages,
      sendMessage,
      markAsRead,
    ]
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
