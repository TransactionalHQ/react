/**
 * @usetransactional/react
 *
 * Official React SDK for Transactional - Auth, Chat, Knowledge Base, and Forms components.
 *
 * @packageDocumentation
 */

// ============================================
// MAIN PROVIDER
// ============================================

export {
  TransactionalProvider,
  TransactionalContext,
  useTransactional,
  useHttpClient,
  useTheme,
} from './provider';

export type {
  TransactionalConfig,
  TransactionalProviderProps,
  TransactionalContextValue,
  AuthConfig,
  ChatConfig as ProviderChatConfig,
  KBConfig as ProviderKBConfig,
  FormsConfig as ProviderFormsConfig,
} from './provider';

// ============================================
// CONSTANTS / ENUMS
// ============================================

export {
  // Theme
  Theme,
  WidgetPosition,
  WidgetSize,

  // Auth
  AuthStatus,
  AuthProvider,
  AuthFormType,

  // Chat
  ChatWidgetState,
  ConversationStatus,
  MessageSenderType,
  MessageType,
  EmailRequirement,
  ReplyTimeLabel,

  // Knowledge Base
  KBLayout,
  ArticleFeedbackType,

  // Forms
  FormFieldType,
  FormStatus,

  // Components
  ComponentSize,
  ButtonVariant,

  // Errors
  ErrorCode,
} from './constants';

// ============================================
// SHARED UTILITIES
// ============================================

export {
  TransactionalError,
  NetworkError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  ServerError,
  RateLimitError,
  ConfigurationError,
} from './shared/errors';

export type { HttpClient } from './shared/http-client';

// ============================================
// THEME
// ============================================

export type {
  ThemeColors,
  ThemeTypography,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeConfig,
} from './styles/theme';

// ============================================
// AUTH MODULE
// ============================================

export {
  TransactionalAuthProvider,
  AuthContext,
  useAuthContext,
  useAuth,
  useUser,
  useSession,
  useRequireAuth,
  LoginForm,
  SignupForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  UserButton,
  ProtectedRoute,
  withAuth,
} from './auth';

export type {
  TransactionalAuthProviderProps,
  AuthUser,
  AuthSession,
  AuthState,
  SignInCredentials,
  SignUpCredentials,
  AuthContextValue,
  LoginFormProps,
  SignupFormProps,
  ForgotPasswordFormProps,
  ResetPasswordFormProps,
  UserButtonProps,
  UserButtonMenuItem,
  ProtectedRouteProps,
} from './auth';

// ============================================
// CHAT MODULE
// ============================================

export {
  ChatProvider,
  ChatContext,
  useChatContext,
  useChat,
  useConversations,
  useMessages,
  useConversation,
  useTracking,
  ChatWidget,
  WidgetLauncher,
  MessageList,
  ConversationView,
} from './chat';

export type {
  ChatProviderProps,
  ChatVisitor,
  ChatConfig,
  ChatMessage,
  ChatConversation,
  ChatState,
  ChatContextValue,
  ChatWidgetProps,
  WidgetLauncherProps,
  MessageListProps,
  ConversationViewProps,
} from './chat';

// ============================================
// KNOWLEDGE BASE MODULE
// ============================================

export {
  KBProvider,
  KBContext,
  useKBContext,
  useKnowledgeBase,
  useCollection,
  useArticle,
  useKBSearch,
  KnowledgeBase,
  ArticleView,
  CollectionView,
  SearchBox,
} from './kb';

export type {
  KBProviderProps,
  KBOrganization,
  KBSettings,
  KBCollection,
  KBArticle,
  KBSearchResult,
  KBState,
  KBContextValue,
  KnowledgeBaseProps,
  ArticleViewProps,
  CollectionViewProps,
  SearchBoxProps,
} from './kb';

// ============================================
// FORMS MODULE
// ============================================

export {
  FormProvider,
  FormContext,
  useFormContext,
  useForm,
  useFormField,
  useFormSubmit,
  TransactionalForm,
  FieldRenderer,
} from './forms';

export type {
  FormProviderProps,
  FormFieldOption,
  FormField,
  FormConfig,
  FormValues,
  FormErrors,
  FormState,
  FormContextValue,
  TransactionalFormProps,
  FieldRendererProps,
} from './forms';
