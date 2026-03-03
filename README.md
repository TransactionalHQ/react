# @usetransactional/react

Official React SDK for [Transactional](https://usetransactional.com) - Auth, Chat, Knowledge Base, and Forms components for React and Next.js applications.

[![npm version](https://badge.fury.io/js/%40usetransactional%2Freact.svg)](https://www.npmjs.com/package/@usetransactional/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @usetransactional/react
# or
yarn add @usetransactional/react
# or
pnpm add @usetransactional/react
```

## Features

- **Chat Widget** - Embeddable support chat for your application
- **Knowledge Base** - Self-service help center components
- **Forms** - Customizable form components with validation
- **Auth Components** - Pre-built authentication UI (coming soon)
- Full TypeScript support
- Works with React 18+ and Next.js 13+
- Customizable styling with CSS variables

## Quick Start

### Chat Widget

Add a support chat widget to your application:

```tsx
import { ChatWidget } from '@usetransactional/react/chat';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <ChatWidget
        projectId="your_project_id"
        // Optional: identify the user
        user={{
          id: 'user_123',
          email: 'user@example.com',
          name: 'John Doe',
        }}
      />
    </div>
  );
}
```

### Knowledge Base

Embed a searchable knowledge base:

```tsx
import { KnowledgeBase } from '@usetransactional/react/kb';

function HelpPage() {
  return (
    <KnowledgeBase
      projectId="your_project_id"
      theme="light"
    />
  );
}
```

Or use individual components:

```tsx
import {
  KBSearch,
  KBArticle,
  KBCollections
} from '@usetransactional/react/kb';

function CustomHelpCenter() {
  return (
    <div>
      <KBSearch projectId="your_project_id" />
      <KBCollections projectId="your_project_id" />
    </div>
  );
}
```

### Forms

Create embeddable forms:

```tsx
import { TransactionalForm } from '@usetransactional/react/forms';

function ContactPage() {
  return (
    <TransactionalForm
      formId="form_xxxxx"
      onSubmit={(data) => {
        console.log('Form submitted:', data);
      }}
      onError={(error) => {
        console.error('Form error:', error);
      }}
    />
  );
}
```

## Components

### Chat

| Component | Description |
|-----------|-------------|
| `ChatWidget` | Floating chat widget with launcher button |
| `ChatWindow` | Standalone chat window component |
| `ChatProvider` | Context provider for chat state |

### Knowledge Base

| Component | Description |
|-----------|-------------|
| `KnowledgeBase` | Full knowledge base with search and navigation |
| `KBSearch` | Search input with results dropdown |
| `KBArticle` | Single article display |
| `KBCollections` | Collection list/grid view |
| `KBProvider` | Context provider for KB state |

### Forms

| Component | Description |
|-----------|-------------|
| `TransactionalForm` | Complete form with all fields |
| `FormField` | Individual form field |
| `FormProvider` | Context provider for form state |

## Configuration

### Chat Widget Options

```tsx
<ChatWidget
  projectId="your_project_id"
  // Identify the current user
  user={{
    id: 'user_123',
    email: 'user@example.com',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
  }}
  // Custom metadata
  metadata={{
    plan: 'pro',
    company: 'Acme Inc',
  }}
  // Positioning
  position="bottom-right" // or "bottom-left"
  // Custom launcher
  launcher={<button>Need help?</button>}
  // Callbacks
  onOpen={() => console.log('Chat opened')}
  onClose={() => console.log('Chat closed')}
  onNewMessage={(message) => console.log('New message:', message)}
/>
```

### Knowledge Base Options

```tsx
<KnowledgeBase
  projectId="your_project_id"
  // Theme
  theme="light" // or "dark" or "system"
  // Custom header
  header={<h1>Help Center</h1>}
  // Hide specific sections
  hideSearch={false}
  hideCollections={false}
  // Callbacks
  onArticleView={(article) => console.log('Viewed:', article.title)}
  onSearch={(query) => console.log('Searched:', query)}
/>
```

## Styling

### CSS Variables

Customize the appearance using CSS variables:

```css
:root {
  --transactional-primary: #3b82f6;
  --transactional-primary-hover: #2563eb;
  --transactional-background: #ffffff;
  --transactional-foreground: #09090b;
  --transactional-muted: #f4f4f5;
  --transactional-muted-foreground: #71717a;
  --transactional-border: #e4e4e7;
  --transactional-radius: 0.5rem;
}
```

### Import Styles

Import the default styles in your app:

```tsx
import '@usetransactional/react/styles.css';
```

Or import component-specific styles:

```tsx
import '@usetransactional/react/chat/styles.css';
import '@usetransactional/react/kb/styles.css';
import '@usetransactional/react/forms/styles.css';
```

## Next.js App Router

For Next.js 13+ with the App Router, use the client directive:

```tsx
'use client';

import { ChatWidget } from '@usetransactional/react/chat';

export function Chat() {
  return <ChatWidget projectId="your_project_id" />;
}
```

## TypeScript

Full TypeScript support is included. Import types as needed:

```typescript
import type {
  ChatWidgetProps,
  KnowledgeBaseProps,
  TransactionalFormProps,
  User,
  Message,
  Article,
} from '@usetransactional/react';
```

## Requirements

- React 18.0.0 or later
- React DOM 18.0.0 or later
- Next.js 13.0.0 or later (optional, for Next.js features)

## Documentation

Full documentation is available at [usetransactional.com/docs/sdks/react](https://usetransactional.com/docs/sdks/react)

## License

MIT - see [LICENSE](LICENSE) for details.
