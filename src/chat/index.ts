/**
 * Chat Module
 *
 * Components and hooks for the chat widget.
 */

// Provider
export { ChatProvider } from './provider';
export type { ChatProviderProps } from './provider';

// Context
export { ChatContext } from './context';
export type {
  ChatVisitor,
  ChatConfig,
  ChatMessage,
  ChatConversation,
  ChatState,
  ChatContextValue,
} from './context';

// Hooks
export {
  useChatContext,
  useChat,
  useConversations,
  useMessages,
  useConversation,
  useTracking,
} from './hooks';

// Components
export { ChatWidget } from './components/chat-widget';
export type { ChatWidgetProps } from './components/chat-widget';

export { WidgetLauncher } from './components/widget-launcher';
export type { WidgetLauncherProps } from './components/widget-launcher';

export { MessageList } from './components/message-list';
export type { MessageListProps } from './components/message-list';

export { ConversationView } from './components/conversation-view';
export type { ConversationViewProps } from './components/conversation-view';
