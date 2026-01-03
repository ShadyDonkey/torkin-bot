# Torkin Bot - Agent Guidelines

## Build & Development Commands

```bash
# Build the Discord bot commands
bun run bot:build

# Run linting
biome check

# Auto-fix linting issues
biome check --write

# Format code
biome format --write

# Check and format in one command
biome check --write --files-ignored=no
```

**Note**: No test framework is currently configured in this project. Use manual testing or add a test framework as needed.

## Code Style Guidelines

### Formatting (Biome)

- **Indentation**: 2 spaces
- **Line width**: 120 characters
- **Quotes**: Single quotes for JS/TS strings, double for JSX
- **Semicolons**: As needed (omitted where unnecessary)
- **Line ending**: LF
- **Trailing commas**: Always included
- **File naming**: kebab-case (strictly enforced)

### Imports

- Use `import type` for type-only imports (enforced by linter)
- Path alias: `@/*` maps to repository root
- Example: `import { search } from '@/server/lib/tmdb'`
- Group imports: external deps first, then internal, then types
- Avoid default exports; prefer named exports
- UI components from `@dressed/react`, core from `dressed`

### TypeScript

- **Strict mode**: Always enabled
- **Target**: ESNext
- **Indexed access**: Use `noUncheckedIndexedAccess` - always check for undefined
- **No implicit overrides**: Explicitly mark overrides
- Type inference preferred over explicit `: Type` annotations when clear from context
- Use `Readonly` for function parameter props: `function foo(props: Readonly<{ bar: string }>)`

### Naming Conventions

- **Functions**: camelCase (`fetchData`, `handleSearch`)
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE (`PG_ERROR`, `DATABASE_URL`)
- **Components**: PascalCase (`PaginationButtons`, `ItemActions`)
- **Types/Interfaces**: PascalCase
- **Enums**: PascalCase with UPPER_SNAKE_CASE members

### Error Handling

- Use `await-to-js` with the `unwrap` helper for async error handling
- Pattern: `const [err, result] = await unwrap(promise)`
- Always check for errors: `if (err) { logger.error(err); return ... }`
- Use centralized logger: `@/server/bot/utilities/logger` for bot, `@/server/utilities/logger` otherwise
- Never swallow errors without logging - no direct console usage

### React/JSX for Discord

- Use `useQuery` for all data fetching - no manual fetch/async-await in components
- Three-level rendering: `query.isLoading` → `query.isError` → data display
- Stateless components - user interactions trigger Discord interactions, not state updates
- Use `deferUpdate()` in component handlers before `updateResponse()` to prevent timeouts
- Use `deferReply()` for slash commands, then `editReply()`
- Always validate interaction metadata: `if (!interaction.message.interaction_metadata) { return await interaction.reply('...', { ephemeral: true }) }`
- Always use `onClick` handlers over custom ID patterns
- Pattern for custom IDs: `{feature}-{action}-{id}{-:optional}` using `@dressed/matcher`
- Components export `pattern` string and default async handler function
- Use `Params<typeof pattern>` for type-safe argument extraction

### Component Communication

- Components pass event handlers as props that trigger Discord interactions
- External interaction triggers fresh render with new data via `useQuery`
- No incremental UI updates - full JSX tree rebuilt on each interaction
- Use fragments `<Fragment key={item.id}>` in lists for proper reconciliation

### Database (ZenStack/PostgreSQL)

- Models defined in `server/zenstack/schemas/*.zmodel`
- Database client: `import { db } from '@/server/lib/db'`
- Handle PostgreSQL errors using `PG_ERROR` enum from `@/server/lib/db`
- Always validate data before database operations
- Use transactions for multi-step operations

### Comments

- **NO COMMENTS** in production code unless explicitly requested
- Exception: TODO comments for future work
- Exception: Complex business logic that requires explanation

### General Best Practices

- Prefer early returns over nested if statements
- Use `?.at(0)` over `[0]` for array access (handles undefined)
- Use `??` operator for nullish coalescing
- Keep functions focused and small (<50 lines when possible)
- Use DRY principles - extract repeated logic to utilities
- Always use strict equality (`===`, `!==`)
- Async functions should have proper error boundaries
- Use `keyv` for caching, `ky` for HTTP requests
- Query keys use array pattern: `['feature', type, id, ...]` for cache invalidation

## Key Architecture Patterns

### Reactive UI Pattern

Commands return JSX components that embed data fetching via `useQuery`. Data retrieval happens during render cycle, not in event handlers. Example: `find.tsx` returns `<ListingsWrapper />` which calls `useQuery` internally.

### Dynamic JSX Updates

Components build complete JSX tree on every user interaction. No diffing or patching - full tree rebuilt with fresh data from `useQuery`. Button clicks trigger pattern matches → new handler → entirely new JSX.

### Component Handler Pattern

Components export `pattern` string (not static ID) and default async handler. Arguments typed via `Params<typeof pattern>`. Example pattern: `watchlist-:id-details{-:originPage}`.

### No useMutation

Components remain stateless. Each interaction is independent - no `setQueryData` or `invalidateQueries` needed. React Query handles caching automatically.

### State Management

Minimal `useState` for UI-only states: `useState(initialPage)`, `useState(undefined)` (focused indices), `useState(false)` (visibility toggles). No `useMemo` or `useCallback`.

### Import Patterns

- Command types from `dressed`: `CommandInteraction`, `CommandConfig`, `CommandOption`
- UI components from `@dressed/react`: `ActionRow`, `Section`, `Button`, `Select`
- Discord formatting from `discord-fmt`: `bold()`, `h3()`, `subtext()`, `emoji()`
- Pattern matching from `@dressed/matcher`: `Pattern`, `Params`, `match()`

### Caching Strategy

- Use `keyv` for caching with Redis adapter in production
- Query keys use array pattern: `['feature', type, id, ...]` for automatic cache invalidation
- Example: `['trending', 'movie', 'week']`, `['find', 'movie', 'matrix']`
- Modifying any element in key array triggers refetch for data freshness

### Conditional Rendering Pattern

- Loading: `query.isLoading` → show fallback UI with disabled elements
- Error: `query.isError` → show ErrorPage with appropriate icon (500, 404, 400)
- Empty: `!query.data` → show empty state message
- Use guard clauses: `if (!item.title) return null` for invalid data
- Early returns for undefined or missing data preferred over nested conditionals
