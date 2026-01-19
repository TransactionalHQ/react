/**
 * Knowledge Base Module
 *
 * Components and hooks for the knowledge base.
 */

// Provider
export { KBProvider } from './provider';
export type { KBProviderProps } from './provider';

// Context
export { KBContext } from './context';
export type {
  KBOrganization,
  KBSettings,
  KBCollection,
  KBArticle,
  KBSearchResult,
  KBState,
  KBContextValue,
} from './context';

// Hooks
export {
  useKBContext,
  useKnowledgeBase,
  useCollection,
  useArticle,
  useKBSearch,
} from './hooks';

// Components
export { KnowledgeBase } from './components/knowledge-base';
export type { KnowledgeBaseProps } from './components/knowledge-base';

export { ArticleView } from './components/article-view';
export type { ArticleViewProps } from './components/article-view';

export { CollectionView } from './components/collection-view';
export type { CollectionViewProps } from './components/collection-view';

export { SearchBox } from './components/search-box';
export type { SearchBoxProps } from './components/search-box';
