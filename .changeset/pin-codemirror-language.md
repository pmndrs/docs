---
'@pmndrs/docs': patch
---

Pin `@codemirror/language` to 6.12.4. Its 6.13.0 imports `@codemirror/streamparser` without
declaring it, so every `npx @pmndrs/docs build` on a fresh runner died with
`ERR_MODULE_NOT_FOUND`. Drop the pin once an upstream release declares the dependency.
