/**
 * Auth Module
 *
 * Components and hooks for authentication.
 */

// Provider
export { TransactionalAuthProvider } from './provider';
export type { TransactionalAuthProviderProps } from './provider';

// Context
export { AuthContext } from './context';
export type {
  AuthUser,
  AuthSession,
  AuthState,
  SignInCredentials,
  SignUpCredentials,
  AuthContextValue,
} from './context';

// Hooks
export {
  useAuthContext,
  useAuth,
  useUser,
  useSession,
  useRequireAuth,
} from './hooks';

// Components
export { LoginForm } from './components/login-form';
export type { LoginFormProps } from './components/login-form';

export { SignupForm } from './components/signup-form';
export type { SignupFormProps } from './components/signup-form';

export { ForgotPasswordForm } from './components/forgot-password-form';
export type { ForgotPasswordFormProps } from './components/forgot-password-form';

export { ResetPasswordForm } from './components/reset-password-form';
export type { ResetPasswordFormProps } from './components/reset-password-form';

export { UserButton } from './components/user-button';
export type { UserButtonProps, UserButtonMenuItem } from './components/user-button';

export { ProtectedRoute, withAuth } from './components/protected-route';
export type { ProtectedRouteProps } from './components/protected-route';
