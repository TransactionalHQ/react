'use client';

/**
 * WidgetLauncher
 *
 * The floating button that opens/closes the chat widget.
 */

import React from 'react';
import { useChat } from '../hooks';
import { ComponentSize } from '../../constants';

// ============================================
// STYLES
// ============================================

const launcherStyles = {
  button: {
    position: 'fixed' as const,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    fontFamily: 'var(--txl-font-family)',
  },
  bottomRight: {
    bottom: '20px',
    right: '20px',
  },
  bottomLeft: {
    bottom: '20px',
    left: '20px',
  },
  sizeSm: {
    width: '48px',
    height: '48px',
    borderRadius: '24px',
  },
  sizeMd: {
    width: '56px',
    height: '56px',
    borderRadius: '28px',
  },
  sizeLg: {
    width: '64px',
    height: '64px',
    borderRadius: '32px',
  },
  badge: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginLeft: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
};

// ============================================
// ICONS
// ============================================

function ChatIcon({ size = 24 }: { size?: number }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon({ size = 24 }: { size?: number }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ============================================
// COMPONENT
// ============================================

export interface WidgetLauncherProps {
  /** Position of the launcher */
  position?: 'bottom-right' | 'bottom-left';
  /** Size of the launcher button */
  size?: ComponentSize;
  /** Primary color (overrides theme) */
  primaryColor?: string;
  /** Text to show next to the icon */
  text?: string;
  /** Show unread badge */
  showBadge?: boolean;
  /** Custom icon when closed */
  icon?: React.ReactNode;
  /** Custom icon when open */
  closeIcon?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Aria label for accessibility */
  'aria-label'?: string;
}

export function WidgetLauncher({
  position = 'bottom-right',
  size = ComponentSize.MD,
  primaryColor,
  text,
  showBadge = true,
  icon,
  closeIcon,
  className = '',
  style = {},
  'aria-label': ariaLabel,
}: WidgetLauncherProps): React.ReactElement | null {
  const { isOpen, toggle, unreadCount, isInitialized } = useChat();

  if (!isInitialized) {
    return null;
  }

  const sizeStyles =
    size === ComponentSize.SM
      ? launcherStyles.sizeSm
      : size === ComponentSize.LG
      ? launcherStyles.sizeLg
      : launcherStyles.sizeMd;

  const positionStyles =
    position === 'bottom-left' ? launcherStyles.bottomLeft : launcherStyles.bottomRight;

  const iconSize = size === ComponentSize.SM ? 20 : size === ComponentSize.LG ? 28 : 24;

  const hasText = text && !isOpen;
  const buttonStyles: React.CSSProperties = {
    ...launcherStyles.button,
    ...positionStyles,
    ...(hasText
      ? {
          width: 'auto',
          paddingLeft: '16px',
          paddingRight: '16px',
          borderRadius: '28px',
        }
      : sizeStyles),
    backgroundColor: primaryColor || 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    boxShadow: 'var(--txl-shadow-lg)',
    ...style,
  };

  return (
    <button
      type="button"
      onClick={toggle}
      style={buttonStyles}
      className={`txl-widget-launcher ${className}`}
      aria-label={ariaLabel || (isOpen ? 'Close chat' : 'Open chat')}
      aria-expanded={isOpen}
    >
      {isOpen
        ? closeIcon || <CloseIcon size={iconSize} />
        : icon || <ChatIcon size={iconSize} />}

      {hasText && <span style={launcherStyles.text}>{text}</span>}

      {showBadge && unreadCount > 0 && !isOpen && (
        <span style={launcherStyles.badge} aria-label={`${unreadCount} unread messages`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
