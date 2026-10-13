---
'@pmndrs/docs': major
---

Remove the built-in `ThemeSeeds` component and its static fragment renderer. The component now belongs to the design-system documentation and must be registered through consumer configuration when needed.

Consumers using `<ThemeSeeds />` must provide their own component in `docs.config.ts`, including a static renderer for standalone HTML fragments. See the [custom components guide](https://docs.pmnd.rs/authoring/custom-components) and the [design-system implementation](https://github.com/pmndrs/design-system/pull/73). Shared theme controls and preset persistence remain available. The former authoring page redirects to the design-system Colors page.
