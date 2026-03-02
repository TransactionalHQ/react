'use client';

/**
 * SearchBox
 *
 * Search input component for knowledge base.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useKBSearch } from '../hooks';
import { KBSearchResult } from '../context';

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    fontFamily: 'var(--txl-font-family)',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    fontSize: '15px',
    border: '1px solid var(--txl-border)',
    borderRadius: 'var(--txl-radius-lg)',
    backgroundColor: 'var(--txl-background)',
    color: 'var(--txl-foreground)',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  },
  inputFocus: {
    borderColor: 'var(--txl-ring)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  icon: {
    position: 'absolute' as const,
    left: '14px',
    color: 'var(--txl-muted-foreground)',
    pointerEvents: 'none' as const,
  },
  clearButton: {
    position: 'absolute' as const,
    right: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: 'var(--txl-muted)',
    color: 'var(--txl-muted-foreground)',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    maxHeight: '400px',
    overflowY: 'auto' as const,
    borderRadius: 'var(--txl-radius-lg)',
    border: '1px solid var(--txl-border)',
    backgroundColor: 'var(--txl-card)',
    boxShadow: 'var(--txl-shadow-lg)',
    zIndex: 50,
  },
  resultItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderBottom: '1px solid var(--txl-border)',
    backgroundColor: 'transparent',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  resultItemHover: {
    backgroundColor: 'var(--txl-muted)',
  },
  resultTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--txl-foreground)',
    marginBottom: '4px',
  },
  resultSnippet: {
    fontSize: '13px',
    color: 'var(--txl-muted-foreground)',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  resultCollection: {
    fontSize: '12px',
    color: 'var(--txl-muted-foreground)',
    marginTop: '4px',
  },
  noResults: {
    padding: '20px',
    textAlign: 'center' as const,
    color: 'var(--txl-muted-foreground)',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid var(--txl-muted)',
    borderTopColor: 'var(--txl-primary)',
    borderRadius: '50%',
    animation: 'txl-spin 1s linear infinite',
  },
};

// ============================================
// ICONS
// ============================================

function SearchIcon({ size = 18 }: { size?: number }) {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon({ size = 12 }: { size?: number }) {
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

export interface SearchBoxProps {
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Show results dropdown */
  showResults?: boolean;
  /** Callback when a result is selected */
  onResultSelect?: (result: KBSearchResult) => void;
  /** Callback when search is performed */
  onSearch?: (query: string) => void;
  /** Callback when search is cleared */
  onClear?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function SearchBox({
  placeholder = 'Search articles...',
  debounceMs = 300,
  showResults = true,
  onResultSelect,
  onSearch,
  onClear,
  className = '',
  style = {},
}: SearchBoxProps): React.ReactElement {
  const { results, query: searchQuery, search, clear, isSearching } = useKBSearch();

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        search(value);
        onSearch?.(value);
      }, debounceMs);
    },
    [search, onSearch, debounceMs]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setInputValue('');
    clear();
    onClear?.();
  }, [clear, onClear]);

  // Handle result selection
  const handleResultClick = useCallback(
    (result: KBSearchResult) => {
      setInputValue('');
      setIsFocused(false);
      clear();
      onResultSelect?.(result);
    },
    [clear, onResultSelect]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const showDropdown =
    showResults && isFocused && (inputValue.length > 0 || results.length > 0);

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, ...style }}
      className={`txl-search-box ${className}`}
    >
      <div style={styles.inputWrapper}>
        <span style={styles.icon}>
          <SearchIcon />
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          style={{
            ...styles.input,
            ...(isFocused ? styles.inputFocus : {}),
          }}
          aria-label="Search"
          aria-expanded={showDropdown}
          role="combobox"
        />
        {inputValue && (
          <button
            type="button"
            style={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {showDropdown && (
        <div style={styles.dropdown} role="listbox" className="txl-animate-fade-in">
          {isSearching ? (
            <div style={styles.loading}>
              <div style={styles.spinner} />
            </div>
          ) : results.length === 0 ? (
            <div style={styles.noResults}>
              {inputValue ? 'No results found' : 'Start typing to search'}
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                style={{
                  ...styles.resultItem,
                  ...(hoveredIndex === index ? styles.resultItemHover : {}),
                  ...(index === results.length - 1 ? { borderBottom: 'none' } : {}),
                }}
                onClick={() => handleResultClick(result)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                role="option"
              >
                <div style={styles.resultTitle}>{result.title}</div>
                {result.snippet && (
                  <div style={styles.resultSnippet}>{result.snippet}</div>
                )}
                {result.collection && (
                  <div style={styles.resultCollection}>
                    in {result.collection.name}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
