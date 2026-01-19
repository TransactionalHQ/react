'use client';

/**
 * UserButton
 *
 * A button that displays the user's avatar and provides a dropdown menu.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../hooks';
import { ComponentSize } from '../../constants';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    position: 'relative' as const,
    display: 'inline-block',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px',
    border: 'none',
    borderRadius: 'var(--txl-radius-full)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  buttonHover: {
    backgroundColor: 'var(--txl-muted)',
  },
  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'var(--txl-primary)',
    color: 'var(--txl-primary-foreground)',
    fontWeight: '500',
    overflow: 'hidden',
  },
  avatarSm: {
    width: '28px',
    height: '28px',
    fontSize: '12px',
  },
  avatarMd: {
    width: '36px',
    height: '36px',
    fontSize: '14px',
  },
  avatarLg: {
    width: '44px',
    height: '44px',
    fontSize: '16px',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  name: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--txl-foreground)',
  },
  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '200px',
    padding: '8px',
    borderRadius: 'var(--txl-radius-lg)',
    border: '1px solid var(--txl-border)',
    backgroundColor: 'var(--txl-card)',
    boxShadow: 'var(--txl-shadow-lg)',
    zIndex: 50,
  },
  userInfo: {
    padding: '8px 12px',
    borderBottom: '1px solid var(--txl-border)',
    marginBottom: '8px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--txl-foreground)',
    marginBottom: '2px',
  },
  userEmail: {
    fontSize: '12px',
    color: 'var(--txl-muted-foreground)',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    borderRadius: 'var(--txl-radius-md)',
    backgroundColor: 'transparent',
    color: 'var(--txl-foreground)',
    fontSize: '14px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  menuItemHover: {
    backgroundColor: 'var(--txl-muted)',
  },
  menuItemDestructive: {
    color: 'var(--txl-destructive)',
  },
};

// ============================================
// ICONS
// ============================================

function LogOutIcon({ size = 16 }: { size?: number }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function UserIcon({ size = 16 }: { size?: number }) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon({ size = 16 }: { size?: number }) {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ============================================
// COMPONENT
// ============================================

export interface UserButtonMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

export interface UserButtonProps {
  /** Show user's name next to avatar */
  showName?: boolean;
  /** Size of the button */
  size?: ComponentSize;
  /** Additional menu items */
  menuItems?: UserButtonMenuItem[];
  /** Show profile link */
  showProfile?: boolean;
  /** Profile URL */
  profileUrl?: string;
  /** Show settings link */
  showSettings?: boolean;
  /** Settings URL */
  settingsUrl?: string;
  /** Callback on profile click */
  onProfile?: () => void;
  /** Callback on settings click */
  onSettings?: () => void;
  /** Callback after sign out */
  onSignOut?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function UserButton({
  showName = false,
  size = ComponentSize.MD,
  menuItems = [],
  showProfile = false,
  profileUrl,
  showSettings = false,
  settingsUrl,
  onProfile,
  onSettings,
  onSignOut,
  className = '',
  style = {},
}: UserButtonProps): React.ReactElement | null {
  const { user, signOut, isLoading, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsOpen(false);
    await signOut();
    onSignOut?.();
  }, [signOut, onSignOut]);

  const handleProfile = useCallback(() => {
    setIsOpen(false);
    if (profileUrl && typeof window !== 'undefined') {
      window.location.href = profileUrl;
    } else {
      onProfile?.();
    }
  }, [profileUrl, onProfile]);

  const handleSettings = useCallback(() => {
    setIsOpen(false);
    if (settingsUrl && typeof window !== 'undefined') {
      window.location.href = settingsUrl;
    } else {
      onSettings?.();
    }
  }, [settingsUrl, onSettings]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const avatarSizeStyle =
    size === ComponentSize.SM
      ? styles.avatarSm
      : size === ComponentSize.LG
      ? styles.avatarLg
      : styles.avatarMd;

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, ...style }}
      className={`txl-user-button ${className}`}
    >
      <button
        type="button"
        style={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div style={{ ...styles.avatar, ...avatarSizeStyle }}>
          {user.image ? (
            <img src={user.image} alt={user.name || 'User'} style={styles.avatarImage} />
          ) : (
            getInitials(user.name, user.email)
          )}
        </div>
        {showName && user.name && <span style={styles.name}>{user.name}</span>}
      </button>

      {isOpen && (
        <div style={styles.dropdown} role="menu" className="txl-animate-fade-in">
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.name || 'User'}</div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>

          {showProfile && (
            <button
              type="button"
              style={{
                ...styles.menuItem,
                ...(hoveredItem === 'profile' ? styles.menuItemHover : {}),
              }}
              onClick={handleProfile}
              onMouseEnter={() => setHoveredItem('profile')}
              onMouseLeave={() => setHoveredItem(null)}
              role="menuitem"
            >
              <UserIcon />
              Profile
            </button>
          )}

          {showSettings && (
            <button
              type="button"
              style={{
                ...styles.menuItem,
                ...(hoveredItem === 'settings' ? styles.menuItemHover : {}),
              }}
              onClick={handleSettings}
              onMouseEnter={() => setHoveredItem('settings')}
              onMouseLeave={() => setHoveredItem(null)}
              role="menuitem"
            >
              <SettingsIcon />
              Settings
            </button>
          )}

          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              style={{
                ...styles.menuItem,
                ...(hoveredItem === `custom-${index}` ? styles.menuItemHover : {}),
                ...(item.destructive ? styles.menuItemDestructive : {}),
              }}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
              onMouseEnter={() => setHoveredItem(`custom-${index}`)}
              onMouseLeave={() => setHoveredItem(null)}
              role="menuitem"
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <button
            type="button"
            style={{
              ...styles.menuItem,
              ...styles.menuItemDestructive,
              ...(hoveredItem === 'signout' ? styles.menuItemHover : {}),
            }}
            onClick={handleSignOut}
            onMouseEnter={() => setHoveredItem('signout')}
            onMouseLeave={() => setHoveredItem(null)}
            disabled={isLoading}
            role="menuitem"
          >
            <LogOutIcon />
            {isLoading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
