/**
 * The website options — the ones that describe *a site* rather than what to compile.
 *
 * One row per option: the environment variable the app reads it as, the flag that sets it, and
 * what it does. The CLI builds its flags from this and `--help` prints the descriptions, the
 * documentation renders it as a table, and the type below names the variables for anything
 * handling them. Said once, from a single place, in every one of those.
 */
export const WEBSITE_OPTIONS = [
  ['NEXT_PUBLIC_LIBNAME', '--libname <name>', 'Library name, e.g. "React Three Fiber"'],
  ['NEXT_PUBLIC_LIBNAME_SHORT', '--libname-short <name>', 'Short name, for narrow screens'],
  ['NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL', '--libname-dotsuffix-label <label>', 'Suffix label'],
  ['NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF', '--libname-dotsuffix-href <url>', 'Suffix link'],
  ['BASE_PATH', '--base-path <path>', 'Base path of the final URL, e.g. "/react-three-fiber"'],
  ['HOME_REDIRECT', '--home-redirect <url>', 'Where "/" redirects to, empty for an index'],
  ['NEXT_PUBLIC_URL', '--url <url>', 'Public URL the website is served from'],
  ['MDX_BASEURL', '--mdx-baseurl <url>', 'Base URL relative assets are resolved against'],
  ['SOURCECODE_BASEURL', '--sourcecode-baseurl <url>', 'Base URL of the "source code" links'],
  ['EDIT_BASEURL', '--edit-baseurl <url>', 'Base URL of the "edit this page" links'],
  ['ICON', '--icon <emoji>', 'Favicon emoji, or a path inside the MDX folder'],
  ['LOGO', '--logo <path>', 'Logo path or URL'],
  ['GITHUB', '--github <url>', 'GitHub URL'],
  ['DISCORD', '--discord <url>', 'Discord URL'],
  ['THEME_PRIMARY', '--theme-primary <color>', 'Seed color of the palette, e.g. "#323e48"'],
  ['THEME_SCHEME', '--theme-scheme <scheme>', 'Palette scheme, e.g. "tonalSpot"'],
  ['THEME_CONTRAST', '--theme-contrast <contrast>', 'Palette contrast, between -1 and 1'],
  ['THEME_NOTE', '--theme-note <color>', 'Color of the NOTE alerts'],
  ['THEME_TIP', '--theme-tip <color>', 'Color of the TIP alerts'],
  ['THEME_IMPORTANT', '--theme-important <color>', 'Color of the IMPORTANT alerts'],
  ['THEME_WARNING', '--theme-warning <color>', 'Color of the WARNING alerts'],
  ['THEME_CAUTION', '--theme-caution <color>', 'Color of the CAUTION alerts'],
] as const satisfies readonly (readonly [variable: string, flag: string, description: string])[]

/** What a website is configured with, as the app reads it: `MDX` and every option above. */
export type WebsiteEnv = Partial<Record<'MDX' | (typeof WEBSITE_OPTIONS)[number][0], string>>
