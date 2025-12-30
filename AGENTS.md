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
- Use centralized logger: `import { logger } from '@/server/bot/utilities/logger'`
- Never swallow errors without logging

### Discord Bot Patterns
- **Commands**: Export `config` object (CommandConfig) and default async function
- **Components**: Export `pattern` string and default async handler function
- **Interactions**: Use `deferReply()` for long operations, then `editReply()`
- **Modals**: Use `reply()` then `updateResponse()` for UX feedback
- **Custom IDs**: Follow pattern: `{feature}-{action}-{id}-{type}-{optional}`
- Example: `find-goto-1`, `watchlist-${id}-details`

### React/JSX for Discord
- Import from `@dressed/react` and `dressed`
- Use ActionRow to group Buttons
- Use Section for text content with optional accessories (Thumbnail/Button)
- Discord formatting via `discord-fmt`: `bold()`, `h3()`, `subtext()`, `emoji()`
- Always return string or JSX, never mixed without proper typing
- Use fragments `<>...</>` for multiple top-level elements

### Database (ZenStack/PostgreSQL)
- Models defined in `server/zenstack/schemas/*.zmodel`
- Database client: `import { db } from '@/server/lib/db'`
- Handle PostgreSQL errors using `PG_ERROR` enum from `@/server/lib/db`
- Always validate data before database operations
- Use transactions for multi-step operations

### Utility Functions
- Re-exported utilities from `@/server/utilities`:
  - `unwrap` - await-to-js error handler
  - `slugify` - string slugification
  - `toMs` - parse time strings
  - `paginateArray` - array pagination

### API Calls
- Use `ky` for HTTP requests (already configured in TMDB client)
- Follow existing client patterns in `@/server/lib/tmdb/api.ts`
- Always add error handling around async operations

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
