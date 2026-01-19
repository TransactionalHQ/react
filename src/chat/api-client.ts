/**
 * Chat Widget API Client
 *
 * Client for the widget API endpoints.
 */

import { HttpClient } from '../shared/http-client';
import { ChatConfig, ChatConversation, ChatMessage, ChatVisitor } from './context';

// ============================================
// TYPES
// ============================================

export interface InitResponse {
  visitor: ChatVisitor;
  config: ChatConfig;
  unreadCount: number;
}

export interface IdentifyResponse {
  visitor: ChatVisitor;
  merged: boolean;
}

export interface CompanyResponse {
  company: {
    id: string;
    name: string;
    domain?: string;
  };
}

export interface ConversationsResponse {
  conversations: ChatConversation[];
}

export interface CreateConversationResponse {
  conversation: {
    id: number;
    status: string;
    createdAt: string;
  };
  message: ChatMessage;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
}

// ============================================
// API CLIENT
// ============================================

export function createChatApiClient(httpClient: HttpClient, inboxId: string) {
  const basePath = `/widget/${inboxId}`;

  /**
   * Initialize the widget - get config and create/return visitor
   */
  async function init(visitorUuid?: string): Promise<InitResponse> {
    const query = visitorUuid ? `?visitorUuid=${visitorUuid}` : '';
    return httpClient.get<InitResponse>(`${basePath}/init${query}`);
  }

  /**
   * Identify a visitor (convert anonymous to identified)
   */
  async function identify(
    visitorUuid: string,
    userId: string,
    userData?: {
      email?: string;
      name?: string;
      phone?: string;
      avatar?: string;
      [key: string]: unknown;
    }
  ): Promise<IdentifyResponse> {
    return httpClient.post<IdentifyResponse>(`${basePath}/identify`, {
      visitorUuid,
      userId,
      userData,
    });
  }

  /**
   * Associate visitor with a company
   */
  async function setCompany(
    visitorUuid: string,
    companyId: string,
    companyData?: {
      name?: string;
      domain?: string;
      industry?: string;
      size?: string;
      plan?: string;
      monthlySpend?: number;
      website?: string;
      [key: string]: unknown;
    }
  ): Promise<CompanyResponse> {
    return httpClient.post<CompanyResponse>(`${basePath}/company`, {
      visitorUuid,
      companyId,
      companyData,
    });
  }

  /**
   * Track page views and custom events
   */
  async function track(
    visitorUuid: string,
    data: {
      type: 'PAGE_VIEW' | 'CUSTOM_EVENT';
      eventName?: string;
      properties?: Record<string, unknown>;
      pageUrl?: string;
      pageTitle?: string;
      referrer?: string;
      sessionId?: string;
    }
  ): Promise<{ success: boolean }> {
    return httpClient.post<{ success: boolean }>(`${basePath}/track`, {
      visitorUuid,
      ...data,
    });
  }

  /**
   * Update visitor attributes
   */
  async function updateVisitor(
    visitorUuid: string,
    attributes: Record<string, unknown>
  ): Promise<{ success: boolean }> {
    return httpClient.post<{ success: boolean }>(`${basePath}/update`, {
      visitorUuid,
      attributes,
    });
  }

  /**
   * Get visitor's conversations
   */
  async function getConversations(visitorUuid: string): Promise<ConversationsResponse> {
    return httpClient.get<ConversationsResponse>(
      `${basePath}/conversations?visitorUuid=${visitorUuid}`
    );
  }

  /**
   * Create a new conversation
   */
  async function createConversation(
    visitorUuid: string,
    message: string,
    subject?: string
  ): Promise<CreateConversationResponse> {
    return httpClient.post<CreateConversationResponse>(`${basePath}/conversations`, {
      visitorUuid,
      message,
      subject,
    });
  }

  /**
   * Get messages for a conversation
   */
  async function getMessages(
    conversationId: number,
    visitorUuid: string,
    options?: {
      before?: string;
      limit?: number;
    }
  ): Promise<MessagesResponse> {
    let query = `?visitorUuid=${visitorUuid}`;
    if (options?.before) query += `&before=${options.before}`;
    if (options?.limit) query += `&limit=${options.limit}`;

    return httpClient.get<MessagesResponse>(
      `${basePath}/conversations/${conversationId}/messages${query}`
    );
  }

  /**
   * Send a message in a conversation
   */
  async function sendMessage(
    conversationId: number,
    visitorUuid: string,
    message: string
  ): Promise<SendMessageResponse> {
    return httpClient.post<SendMessageResponse>(
      `${basePath}/conversations/${conversationId}/messages`,
      {
        visitorUuid,
        message,
      }
    );
  }

  /**
   * Mark conversation as read by visitor
   */
  async function markAsRead(
    conversationId: number,
    visitorUuid: string
  ): Promise<{ success: boolean }> {
    return httpClient.post<{ success: boolean }>(
      `${basePath}/conversations/${conversationId}/read?visitorUuid=${visitorUuid}`
    );
  }

  return {
    init,
    identify,
    setCompany,
    track,
    updateVisitor,
    getConversations,
    createConversation,
    getMessages,
    sendMessage,
    markAsRead,
  };
}

export type ChatApiClient = ReturnType<typeof createChatApiClient>;
