---
'@pmndrs/docs': patch
---

Move the `libs` registry out of `src/app/page.tsx` and into `src/libs.ts`, a module with no Next imports.

The page keeps the icon imports and pairs them with the entries it renders; the MCP route reads the plain module instead of importing a page backwards. Anything that is not a browser — a script, a test, the CLI — can now read the registry.
