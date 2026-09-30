---
'@pmndrs/docs': patch
---

Render shields.io badges as neutral shadcn `Badge`s, translating only what their URL declares — label, message, link and `logo=` — with no network access: live ones (npm version and downloads, discord...) show their name, never their value. A paragraph with a shields.io image that cannot be read keeps all of its images. Expose `<Badge href color label logo>` to MDX, `color` taking any theme color role, and keep badges inline wherever they are written. Add a `storybook` theme color (`THEME_STORYBOOK`, `#ff4785`) for authors to declare, `<Badge color="storybook" logo="storybook">`.
