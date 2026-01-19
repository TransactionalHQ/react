/**
 * Chat Context
 *
 * Context and types for the chat widget.
 */

import { createContext } from 'react';
import {
  ChatWidgetState,
  ConversationStatus,
  MessageSenderType,
  MessageType,
} from '../constants';

// ============================================
// TYPES
// ============================================

export interface ChatVisitor {
  uuid: string;
  name?: string;
  email?: string;
  identified: boolean;
}

export interface ChatConfig {
  position: 'bottom-right' | 'bottom-left';
  theme: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  welcomeMessage?: string;
  teamIntro?: string;
  replyTime?: string;
  emailRequirement: 'required' | 'optional' | 'hidden';
  offlineMessage?: string;
  launcherText?: string;
  defaultState: 'open' | 'closed';
}

export interface ChatMessage {
  id: number;
  senderType: MessageSenderType;
  content: string;
  type: MessageType;
  createdAt: string;
  readAt?: string;
}

export interface ChatConversation {
  id: number;
  subject?: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageAt: string;
  preview?: string;
  createdAt: string;
}

export interface ChatState {
  widgetState: ChatWidgetState;
  visitor: ChatVisitor | null;
  config: ChatConfig | null;
  conversations: ChatConversation[];
  activeConversationId: number | null;
  messages: ChatMessage[];
  unreadCount: number;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface ChatContextValue extends ChatState {
  // Widget controls
  open: () => void;
  close: () => void;
  toggle: () => void;

  // Visitor identification
  identify: (userId: string, userData?: {
    email?: string;
    name?: string;
    phone?: string;
    avatar?: string;
    [key: string]: unknown;
  }) => Promise<void>;

  // Tracking
  trackPageView: (url?: string, title?: string) => Promise<void>;
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => Promise<void>;

  // Conversations
  loadConversations: () => Promise<void>;
  createConversation: (message: string, subject?: string) => Promise<void>;
  selectConversation: (conversationId: number) => void;
  clearActiveConversation: () => void;

  // Messages
  loadMessages: (conversationId: number) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  markAsRead: (conversationId: number) => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

export const ChatContext = createContext<ChatContextValue | null>(null);
