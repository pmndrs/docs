---
'@pmndrs/docs': patch
---

Render shields.io badges as shadcn `Badge`s, with no network access: static badges (e.g. the `storybook` and `suspense` tags) with their label, message and logo, and live ones (npm version and downloads, discord...) with their name and logo, never their value. A paragraph with a shields.io image that cannot be read keeps all of its images. Expose `<Badge href color label logo>` to MDX, `color` taking any theme color role, and keep badges inline wherever they are written. Add a `storybook` theme color (`THEME_STORYBOOK`, `#ff4785`), which Storybook badges take.
