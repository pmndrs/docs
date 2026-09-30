---
'@pmndrs/docs': patch
---

Expose a `<Badge href color label logo>` MDX component, a shadcn `Badge`: `color` takes any theme color role, `logo` a simple-icons slug (`storybook`, `chromatic`, `discord`, `github`, `npm`). Badges stay inline wherever they are written, consecutive ones making one row. Add a `storybook` theme color (`THEME_STORYBOOK`, `#ff4785`), for `<Badge color="storybook" logo="storybook">`. shields.io images are left untouched.
