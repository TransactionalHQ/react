/**
 * Transactional React SDK Constants
 * All enums and constants for the SDK
 */

// ============================================
// THEME ENUMS
// ============================================

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum WidgetPosition {
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left',
}

export enum WidgetSize {
  COMPACT = 'compact',
  STANDARD = 'standard',
  LARGE = 'large',
}

// ============================================
// AUTH ENUMS
// ============================================

export enum AuthStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
}

export enum AuthFormType {
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
}

// ============================================
// CHAT ENUMS
// ============================================

export enum ChatWidgetState {
  CLOSED = 'closed',
  OPEN = 'open',
  MINIMIZED = 'minimized',
}

export enum ConversationStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum MessageSenderType {
  VISITOR = 'visitor',
  AGENT = 'agent',
  BOT = 'bot',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum EmailRequirement {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  HIDDEN = 'hidden',
}

export enum ReplyTimeLabel {
  FEW_MINUTES = 'few_minutes',
  FEW_HOURS = 'few_hours',
  ONE_DAY = 'one_day',
}

// ============================================
// KNOWLEDGE BASE ENUMS
// ============================================

export enum KBLayout {
  SIDEBAR = 'sidebar',
  CARDS = 'cards',
  LIST = 'list',
}

export enum ArticleFeedbackType {
  HELPFUL = 'helpful',
  NOT_HELPFUL = 'not_helpful',
}

// ============================================
// FORMS ENUMS
// ============================================

export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  NUMBER = 'number',
  PHONE = 'phone',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  FILE = 'file',
}

export enum FormStatus {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error',
}

// ============================================
// COMPONENT SIZE ENUMS
// ============================================

export enum ComponentSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

export enum ButtonVariant {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  GHOST = 'ghost',
  DESTRUCTIVE = 'destructive',
}

// ============================================
// ERROR CODES
// ============================================

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}
