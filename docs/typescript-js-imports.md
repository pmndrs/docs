# TypeScript Type Checking with .js Imports

## Question: Does importing from `.js` modules prevent type checking?

**Answer: No, it does not prevent type checking.**

## How It Works

When you import from a `.js` file in TypeScript:

```typescript
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
```

TypeScript automatically looks for and uses the corresponding `.d.ts` file (in this case, `mcp.d.ts`) for type information. This is a standard feature of TypeScript's module resolution.

## Why Use .js Extensions in TypeScript?

With modern TypeScript and ESM (ECMAScript Modules):

1. **Runtime Reality**: The `.js` extension refers to what will exist at runtime after compilation
2. **ESM Specification**: The ESM specification requires explicit file extensions
3. **Modern Module Resolution**: TypeScript's `"moduleResolution": "bundler"` handles this correctly

## Verification

You can verify type checking works by:

1. **Build Output**: The Next.js build shows "Running TypeScript ..." and catches type errors
2. **IDE Support**: IntelliSense and autocomplete work correctly with these imports
3. **Type Safety**: The code has full type checking, including:
   - Function parameters
   - Return types
   - Object shapes
   - Method signatures

## Example in This Project

In `src/app/api/[transport]/route.ts`, the import:

```typescript
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
```

Provides full type checking for:

- The `ResourceTemplate` constructor parameters
- The `list` callback return type (must be `{ resources: Array<...> }`)
- The `registerResource` callback parameters and return type
- All method signatures on `ResourceTemplate` instances

## Related Files

- Source: `node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js`
- Types: `node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts`

The `.d.ts` file contains all type definitions and is automatically used by TypeScript.
