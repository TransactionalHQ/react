/**
 * CSS Variables injection utility
 *
 * Injects theme CSS variables into the document head.
 */

import { generateCssVariables, ThemeConfig } from './theme';

let styleElement: HTMLStyleElement | null = null;

/**
 * Get or create the style element for CSS variables
 */
function getStyleElement(): HTMLStyleElement {
  if (typeof document === 'undefined') {
    throw new Error('Cannot inject CSS variables on the server');
  }

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'txl-theme-variables';
    document.head.appendChild(styleElement);
  }

  return styleElement;
}

/**
 * Inject CSS variables into the document
 */
export function injectCssVariables(theme: ThemeConfig, isDark: boolean): void {
  const variables = generateCssVariables(theme, isDark);
  const variablesString = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  const css = `
:root, .txl-root {
${variablesString}
}

.txl-dark {
${Object.entries(generateCssVariables(theme, true))
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}
`;

  try {
    const element = getStyleElement();
    element.textContent = css;
  } catch {
    // SSR - ignore
  }
}

/**
 * Remove injected CSS variables
 */
export function removeCssVariables(): void {
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
    styleElement = null;
  }
}

/**
 * Base CSS styles for the SDK components
 */
export const baseCss = `
/* Transactional React SDK Base Styles */
.txl-root {
  font-family: var(--txl-font-family);
  font-size: var(--txl-font-size-base);
  color: var(--txl-foreground);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.txl-root *,
.txl-root *::before,
.txl-root *::after {
  box-sizing: border-box;
}

/* Button base */
.txl-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: var(--txl-radius-md);
  font-size: var(--txl-font-size-sm);
  font-weight: 500;
  transition: all 150ms ease;
  cursor: pointer;
  border: none;
  outline: none;
}

.txl-button:focus-visible {
  outline: 2px solid var(--txl-ring);
  outline-offset: 2px;
}

.txl-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.txl-button-primary {
  background-color: var(--txl-primary);
  color: var(--txl-primary-foreground);
}

.txl-button-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.txl-button-secondary {
  background-color: var(--txl-muted);
  color: var(--txl-foreground);
}

.txl-button-secondary:hover:not(:disabled) {
  background-color: var(--txl-accent);
}

.txl-button-ghost {
  background-color: transparent;
  color: var(--txl-foreground);
}

.txl-button-ghost:hover:not(:disabled) {
  background-color: var(--txl-accent);
}

.txl-button-sm {
  height: 2rem;
  padding: 0 0.75rem;
  font-size: var(--txl-font-size-xs);
}

.txl-button-md {
  height: 2.5rem;
  padding: 0 1rem;
}

.txl-button-lg {
  height: 3rem;
  padding: 0 1.5rem;
  font-size: var(--txl-font-size-base);
}

/* Input base */
.txl-input {
  display: flex;
  width: 100%;
  border-radius: var(--txl-radius-md);
  border: 1px solid var(--txl-input);
  background-color: var(--txl-background);
  padding: 0.5rem 0.75rem;
  font-size: var(--txl-font-size-sm);
  color: var(--txl-foreground);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.txl-input::placeholder {
  color: var(--txl-muted-foreground);
}

.txl-input:focus {
  outline: none;
  border-color: var(--txl-ring);
  box-shadow: 0 0 0 2px var(--txl-ring) / 0.2;
}

.txl-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Card base */
.txl-card {
  border-radius: var(--txl-radius-lg);
  border: 1px solid var(--txl-border);
  background-color: var(--txl-card);
  color: var(--txl-card-foreground);
  box-shadow: var(--txl-shadow-sm);
}

/* Animations */
@keyframes txl-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes txl-slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes txl-slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes txl-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes txl-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.txl-animate-fade-in {
  animation: txl-fade-in 200ms ease-out;
}

.txl-animate-slide-up {
  animation: txl-slide-up 200ms ease-out;
}

.txl-animate-slide-in-right {
  animation: txl-slide-in-right 300ms ease-out;
}

.txl-animate-scale-in {
  animation: txl-scale-in 200ms ease-out;
}

.txl-animate-spin {
  animation: txl-spin 1s linear infinite;
}

/* Utility classes */
.txl-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
`;

/**
 * Inject base CSS styles
 */
let baseStyleElement: HTMLStyleElement | null = null;

export function injectBaseCss(): void {
  if (typeof document === 'undefined') return;
  if (baseStyleElement) return;

  baseStyleElement = document.createElement('style');
  baseStyleElement.id = 'txl-base-styles';
  baseStyleElement.textContent = baseCss;
  document.head.appendChild(baseStyleElement);
}

/**
 * Remove base CSS styles
 */
export function removeBaseCss(): void {
  if (baseStyleElement && baseStyleElement.parentNode) {
    baseStyleElement.parentNode.removeChild(baseStyleElement);
    baseStyleElement = null;
  }
}
