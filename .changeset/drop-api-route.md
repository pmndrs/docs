---
'@pmndrs/docs': patch
---

Stop publishing `src/app/api`. A Route Handler cannot be statically exported, and the CLI
already leaves it behind when it copies the app, so it only ever travelled as dead weight —
37 kB of it, once its test is counted.

One test file still ships, `src/app/[...slug]/page.test.ts`. Nothing under a bracketed
directory can be excluded through `files` under `pnpm`, whatever the pattern: `npm pack` honours
`!**/*.test.*` there, `pnpm pack` does not, and neither a directory negation nor an escaped
bracket reaches it.
