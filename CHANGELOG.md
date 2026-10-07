# @pmndrs/docs

## 4.17.1

### Patch Changes

- [#672](https://github.com/pmndrs/docs/pull/672) [`96b1fd7`](https://github.com/pmndrs/docs/commit/96b1fd7825e2da2b32c1d894a8512287becc089f) Thanks [@abernier](https://github.com/abernier)! - List `design-system` in the header's libraries menu, and read it in `browse` and over MCP. Its docs
  are built with this generator and publish a `llms-full.txt` at `pmndrs.github.io/design-system`.

## 4.17.0

### Minor Changes

- [#673](https://github.com/pmndrs/docs/pull/673) [`204af0f`](https://github.com/pmndrs/docs/commit/204af0f6a5d312ca6092303470b5cdf81d22af1e) Thanks [@abernier](https://github.com/abernier)! - feat: `THEME_CUSTOM_COLORS`, a site's own custom colors as roles of the theme

  `THEME_CUSTOM_COLORS` (workflow input `theme_custom_colors`, CLI `--theme-custom-colors`) takes `name:hex[:blend]` entries, comma-separated, e.g. `brand:#ff2d95:blend,status:#17b26a`: each is a custom color of `<Mtb>` next to the built-in `note`, `tip`…, so `<Color role="brand" />` and `bg-brand` follow the scheme, contrast and primary the reader picks instead of a hex pasted in the page. A malformed entry, or a built-in name, fails the build with its reason.

## 4.16.0

### Minor Changes

- [#668](https://github.com/pmndrs/docs/pull/668) [`86e3422`](https://github.com/pmndrs/docs/commit/86e3422fc55cdaedb2a417ef8857f4471e38634b) Thanks [@abernier](https://github.com/abernier)! - feat: `Color` and `ColorGroup`, MDX swatches of the theme's color roles

  A `Color` is a swatch of a Material color role (or any CSS color): inline, a disc by default, or a cell with the role's name on it. A `ColorGroup` fuses cells into one rounded block, horizontal or vertical, nesting as Material's scheme poster does. The theme-color picker reuses the disc.

## 4.15.0

### Minor Changes

- [#666](https://github.com/pmndrs/docs/pull/666) [`6125fc8`](https://github.com/pmndrs/docs/commit/6125fc82a46d2b6b44da4b8e84cc0bdaf0ad761a) Thanks [@abernier](https://github.com/abernier)! - A scheme toggle next to the contrast one: each click cycles the palette's Material scheme -- tonal spot, vibrant, expressive, fidelity, content, monochrome, neutral -- from the site's own (`THEME_SCHEME`), at whatever contrast level is picked. Remembered across pages, reloads and tabs, and shown from the first paint, as the color and contrast are. The scheme and contrast toggles now show their current value in a tooltip on hover.

## 4.14.0

### Minor Changes

- [#663](https://github.com/pmndrs/docs/pull/663) [`04d37d3`](https://github.com/pmndrs/docs/commit/04d37d3aa1dda3a6134c62e14517a8f13620987e) Thanks [@abernier](https://github.com/abernier)! - Code blocks take their syntax colors from the site's palette: the accents rotate the seed's hue, so they follow `THEME_PRIMARY` and the reader's picked color while staying apart from each other. Diff lines stay green and red, and no longer look washed out in light mode.

### Patch Changes

- [#665](https://github.com/pmndrs/docs/pull/665) [`b0e3115`](https://github.com/pmndrs/docs/commit/b0e3115b356b64e3886a99d3ae1fea39b3040e6a) Thanks [@abernier](https://github.com/abernier)! - Inline code keeps a readable text color on its own background, which it no longer inherits: in the sidebar's current page at high contrast, it had turned near-black on a dark chip.

## 4.13.0

### Minor Changes

- [#661](https://github.com/pmndrs/docs/pull/661) [`06b671f`](https://github.com/pmndrs/docs/commit/06b671fe9d1dc0c5d860aef66ab6bb1819fe8835) Thanks [@abernier](https://github.com/abernier)! - A contrast toggle next to the theme color and light/dark switches: each click cycles the palette's Material contrast level -- standard, medium, high -- remembered across pages, reloads and tabs, and shown from the first paint. Code blocks now keep their dark background at every level: they were built on the `*-fixed` roles, which Material keeps across light and dark but not across contrast levels.

## 4.12.0

### Minor Changes

- [#658](https://github.com/pmndrs/docs/pull/658) [`09f7fd3`](https://github.com/pmndrs/docs/commit/09f7fd3fc13d0f973f0465e6fa8df2ab51b70d31) Thanks [@abernier](https://github.com/abernier)! - The MCP server gains a `search_docs` tool: a query, optionally one library, and it answers with the best-matching pages -- ranked the way `npx @pmndrs/docs search` ranks them -- each with the `lib` and `path` to read it with `get_page_content`. Its tool descriptions and manifest now tell agents to search before answering, since the docs are newer than their training data.

- [#653](https://github.com/pmndrs/docs/pull/653) [`9e10de8`](https://github.com/pmndrs/docs/commit/9e10de84e4aac945a5d5cda70b3f09d82a2fe236) Thanks [@abernier](https://github.com/abernier)! - A color swatch at the foot of the table of contents (of the sidebar, on narrower screens) lets the reader re-seed the site's palette with a color of their own, remembered across pages, reloads and browser tabs; picking the site's default again goes back to it.

- [#653](https://github.com/pmndrs/docs/pull/653) [`9e10de8`](https://github.com/pmndrs/docs/commit/9e10de84e4aac945a5d5cda70b3f09d82a2fe236) Thanks [@abernier](https://github.com/abernier)! - A button beside that swatch switches the site between light, dark and the system's scheme, remembered across pages, reloads and browser tabs.

### Patch Changes

- [#654](https://github.com/pmndrs/docs/pull/654) [`9a9c3ea`](https://github.com/pmndrs/docs/commit/9a9c3ea142ae5a949e8ec7e923b3b0803e723d57) Thanks [@abernier](https://github.com/abernier)! - The live view of the MCP server's requests, on the Agents page, no longer 404s on a static
  export. `/mcp/live` is server-only, so a static export now embeds and links to the one
  docs.pmnd.rs serves, while `next dev` and docs.pmnd.rs keep their own, under `BASE_PATH`. It is
  an MDX component, `<McpLiveEmbed />`.

- [#659](https://github.com/pmndrs/docs/pull/659) [`333ac9d`](https://github.com/pmndrs/docs/commit/333ac9d46d41c0a38bde110cc6bb3f888f669224) Thanks [@abernier](https://github.com/abernier)! - The MCP server at `/api/mcp` now answers browser preflights and sends CORS headers, answers an empty or malformed JSON body with a 400 parse error instead of hanging until the function times out, and logs one line for every request it refuses.

## 4.11.0

### Minor Changes

- [#647](https://github.com/pmndrs/docs/pull/647) [`711c537`](https://github.com/pmndrs/docs/commit/711c5372510ff9a3d1321570bef46afe71916084) Thanks [@kvvasuu](https://github.com/kvvasuu)! - An optional `syncKey` on `Tabs` makes every `Tabs` of the same key switch together, and remembers the pick across pages, reloads and browser tabs.

### Patch Changes

- [#651](https://github.com/pmndrs/docs/pull/651) [`c0f0fac`](https://github.com/pmndrs/docs/commit/c0f0facaf265bceb3c0dae53c20212bdfdb4b8ba) Thanks [@abernier](https://github.com/abernier)! - List `denoiser` in the header's libraries menu, and read it in `browse` and over MCP. Its docs
  are built with this generator and publish a `llms-full.txt` at `pmndrs.github.io/denoiser/docs`,
  but the library was never registered in `libs`.

## 4.10.0

### Minor Changes

- [#648](https://github.com/pmndrs/docs/pull/648) [`50a1b31`](https://github.com/pmndrs/docs/commit/50a1b31e206ddb51062556686d8a0d4b82bebb91) Thanks [@abernier](https://github.com/abernier)! - Each site now publishes its icon at `/icon.svg`, built from `ICON`: an emoji is drawn as before,
  and an image path (local to `MDX`) is embedded as a data URI, so the file stands on its own. The
  favicon of every page points at it. An `ICON` path that is missing, or not an image, now fails the
  build instead of linking to a broken favicon.

  The header's libraries menu, and the cards of the docs hub, show each library's own `/icon.svg`
  when it has no bundled icon, and a generic package icon until that site is rebuilt.

## 4.9.0

### Minor Changes

- [#640](https://github.com/pmndrs/docs/pull/640) [`3167b88`](https://github.com/pmndrs/docs/commit/3167b88868c39e92b3a6a6cdca51bb5e08a89b9d) Thanks [@abernier](https://github.com/abernier)! - The markdown of a page is now at the page's own URL plus `.md`, e.g.
  `/getting-started/introduction.md`, instead of `/md/getting-started/introduction.md`. The "Copy Page"
  and "View as Markdown" actions use the new URL. On a server deployment the old `/md/<path>.md` URLs
  permanently redirect to the new ones; a static export writes the files at the new paths only, so
  there the old URLs are a 404.

- [#641](https://github.com/pmndrs/docs/pull/641) [`3a690ad`](https://github.com/pmndrs/docs/commit/3a690ad553fca203607402dad08902e974fe908f) Thanks [@abernier](https://github.com/abernier)! - Under the table of contents, a card calls to sponsor Poimandres on GitHub
  (https://github.com/sponsors/pmndrs), like the "Deploy on Vercel" card of the shadcn/ui docs. It
  stays in view with the table of contents, and is hidden where it is (below `xl`).

### Patch Changes

- [#644](https://github.com/pmndrs/docs/pull/644) [`ef58d2d`](https://github.com/pmndrs/docs/commit/ef58d2d668cd18a568492afcbae65abfe6b452de) Thanks [@abernier](https://github.com/abernier)! - Sandpack previews that depend on `three` at `latest` (or any version from 0.186.0) work again: the
  component now pins `three` to 0.185.1 for them. Since 0.186.0, three's CommonJS entry calls
  `process.emitWarning`, which Sandpack's in-browser bundler does not provide, so those previews failed
  with `process.emitWarning is not a function`.

- [#639](https://github.com/pmndrs/docs/pull/639) [`c705277`](https://github.com/pmndrs/docs/commit/c705277fdc163b6827f3b92c4723a015ce815a36) Thanks [@abernier](https://github.com/abernier)! - A path that is not a page of the docs (`/sitemap.xml`, `/.well-known/...`, a mistyped URL) is now a
  404 on a server deployment, instead of a 500: the catch-all route only serves the pages built from
  the MDX folder, and no longer tries to render anything else at runtime, where `MDX` may be unset.
  The same goes for the markdown of a page that does not exist.

## 4.8.0

### Minor Changes

- [#637](https://github.com/pmndrs/docs/pull/637) [`bea34bb`](https://github.com/pmndrs/docs/commit/bea34bb7227e971adae554dd52a281fa238eb454) Thanks [@abernier](https://github.com/abernier)! - A code block takes a file name, as ` ```ts title="lib/utils.ts" `: a header above the code shows
  it, with the icon of its file type (TypeScript, React, JavaScript, CSS, JSON, YAML, HTML, Markdown,
  MDX, shell) and the copy button, like the shadcn/ui docs.

  A long one can be `collapsible` (` ```css title="globals.css" collapsible `, with or without a
  title): it shows its first lines under a fade, with an "Expand" button next to the copy one, and
  the fade itself to click.

  Blocks without either render as before.

## 4.7.0

### Minor Changes

- [#620](https://github.com/pmndrs/docs/pull/620) [`6713de5`](https://github.com/pmndrs/docs/commit/6713de5fd155d2b8402d5dbd009ba584405af818) Thanks [@abernier](https://github.com/abernier)! - Add `npm` and `chromatic` theme colors (`THEME_NPM`, `#cb3837`, and `THEME_CHROMATIC`, `#fc521f`),
  for `<Badge color="npm" logo="npm">` and `<Badge color="chromatic" logo="chromatic">`, next to
  `storybook`.

- [#631](https://github.com/pmndrs/docs/pull/631) [`6158f69`](https://github.com/pmndrs/docs/commit/6158f6956ae38c061d4b7f0189d733260ec442bd) Thanks [@abernier](https://github.com/abernier)! - Add `Steps` and `Step` MDX components: every `<Step>` heading inside `<Steps>` becomes a numbered
  step, hanging on a vertical line from `md` up, like shadcn/ui's installation steps.

- [#630](https://github.com/pmndrs/docs/pull/630) [`c96a3c4`](https://github.com/pmndrs/docs/commit/c96a3c465e07a14a9423d5019a38f4287f851d7c) Thanks [@abernier](https://github.com/abernier)! - A ` ```bash `, ` ```sh ` or ` ```shell ` block of npm commands (`npm install`, `npm i`, `npx`,
  `npm create`, `npm run`) now shows a tab per package manager — pnpm, npm, yarn and bun — and copies
  the command of the active one. The reader's pick is shared by every block and remembered. Other
  blocks render as before.

- [#635](https://github.com/pmndrs/docs/pull/635) [`f54ddef`](https://github.com/pmndrs/docs/commit/f54ddefecec8a604f2410ff2b8378400c919e35b) Thanks [@abernier](https://github.com/abernier)! - Wide tables and code blocks (package-manager tabs included) now fade their edges while scrolled
  horizontally, with shadcn's `scroll-fade-x` utility: the fade shows only on the side with more
  content, and nothing fades when the content fits. Their scrollbar is hidden.

- [#632](https://github.com/pmndrs/docs/pull/632) [`e58ba81`](https://github.com/pmndrs/docs/commit/e58ba81850d49ead9ec1de4ba0047b20946adce5) Thanks [@abernier](https://github.com/abernier)! - Add `Tabs` MDX component

- [#633](https://github.com/pmndrs/docs/pull/633) [`b7daecb`](https://github.com/pmndrs/docs/commit/b7daecb089f4e7a193481739f0560ec1f03ef266) Thanks [@abernier](https://github.com/abernier)! - Headings nested in a component (`TabsContent`, `Details`, `Grid`...) now get an anchor and appear
  in the table of contents, and a link to one in a hidden tab opens that tab. The same title twice
  in a page now gets a `-1`, `-2`... suffixed anchor. Search content follows: a nested heading owns
  the text of its component, and tab labels, imports and expressions are no longer indexed.

### Patch Changes

- [#627](https://github.com/pmndrs/docs/pull/627) [`a0aa2e2`](https://github.com/pmndrs/docs/commit/a0aa2e222565b28d982c91d18017cb98ac6b0912) Thanks [@abernier](https://github.com/abernier)! - `<Badge color="storybook|npm|chromatic">` wears the exact brand color (`THEME_STORYBOOK`,
  `THEME_NPM`, `THEME_CHROMATIC`), with white text, in light and dark alike, instead of a muted
  Material tone of it.

- [#629](https://github.com/pmndrs/docs/pull/629) [`57b96d5`](https://github.com/pmndrs/docs/commit/57b96d56c45240afeef81228d8f2654cbdccbf34) Thanks [@abernier](https://github.com/abernier)! - The table of contents no longer counts the first node after each heading twice in that heading's
  `content` (used for search).

## 4.6.0

### Minor Changes

- [#622](https://github.com/pmndrs/docs/pull/622) [`8c6045f`](https://github.com/pmndrs/docs/commit/8c6045f097a325c95c3651f2ce940d9cb3b56f44) Thanks [@abernier](https://github.com/abernier)! - Version label in the sidebar footer (`git describe --tags`), opening a branch switcher to the same page on each branch's deployment when `VERSION_URL_TEMPLATE` is set.

## 4.5.0

### Minor Changes

- [#617](https://github.com/pmndrs/docs/pull/617) [`e3cf4f3`](https://github.com/pmndrs/docs/commit/e3cf4f352358566d112bbd7277e9cc9a1578ffd5) Thanks [@abernier](https://github.com/abernier)! - The header shows the official GitHub and Discord logos, and the GitHub link now carries the repo's
  star count (`33k`), fetched once at build time from the `GITHUB` repo. It reuses
  `CONTRIBUTORS_PAT` when set, and the link simply shows without a count if the GitHub API cannot be
  reached.

## 4.4.0

### Minor Changes

- [#615](https://github.com/pmndrs/docs/pull/615) [`038a703`](https://github.com/pmndrs/docs/commit/038a7036a44a8e33a6cf79d587deddd4e183409e) Thanks [@abernier](https://github.com/abernier)! - Page actions in each doc header: a "Copy Page" split button that copies the page as markdown, with a menu to view it as markdown, copy the `npx @pmndrs/docs <lib>/<path>` command that opens it in the CLI, or open it in ChatGPT or Claude. Every page is now also served as raw markdown at `/md/<path>.md`, included in the static export.

- [#614](https://github.com/pmndrs/docs/pull/614) [`753eada`](https://github.com/pmndrs/docs/commit/753eada066c2c9823397dafda5f13f1f0695a7d8) Thanks [@abernier](https://github.com/abernier)! - The library name in the header now opens a menu of the pmndrs libraries whose docs are built with
  `@pmndrs/docs`, each with its icon; the one the site documents is checked and leads to the home of
  its docs. `libs` gains a `pmndrs_docs` flag to mark
  those libraries, and React Three Jolt, Sky and timeline join the list. The ".docs" suffix that
  followed the name is gone, so the `libname_dotsuffix_label` and `libname_dotsuffix_href` inputs of
  the reusable workflow, and the `--libname-dotsuffix-label` and `--libname-dotsuffix-href` options
  of the CLI, are deprecated and now ignored. They are still accepted, so existing callers keep
  working unchanged.

## 4.3.1

### Patch Changes

- [#611](https://github.com/pmndrs/docs/pull/611) [`eb045ee`](https://github.com/pmndrs/docs/commit/eb045ee3465aa0a2d94743df1b27bf4cb6e8c4af) Thanks [@abernier](https://github.com/abernier)! - Expose a `<Badge href color label logo>` MDX component, a shadcn `Badge`: `color` takes any theme color role, `logo` a simple-icons slug (`storybook`, `chromatic`, `discord`, `github`, `npm`). Badges stay inline wherever they are written, consecutive ones making one row. Add a `storybook` theme color (`THEME_STORYBOOK`, `#ff4785`), for `<Badge color="storybook" logo="storybook">`. shields.io images are left untouched.

## 4.3.0

### Minor Changes

- [#608](https://github.com/pmndrs/docs/pull/608) [`3f49b07`](https://github.com/pmndrs/docs/commit/3f49b07625489323026bbbed39d8cf463bf2920b) Thanks [@abernier](https://github.com/abernier)! - `<Codesandbox>` takes its preview image from a new `img` prop, since CodeSandbox no longer serves
  sandbox screenshots and every preview had turned into a broken image. Like an `<img src>`, `img` can
  be relative to the page, which also gets its dimensions read, or a full URL. The same image is the
  page's thumb in `<Entries>`. Without `img`, a neutral placeholder with the CodeSandbox mark stands
  in, still linking to the sandbox, and `<Entries>` shows the mark alone. `screenshot_url`, the
  former undocumented name of `img`, still works but is deprecated.

## 4.2.0

### Minor Changes

- [#605](https://github.com/pmndrs/docs/pull/605) [`2274a4e`](https://github.com/pmndrs/docs/commit/2274a4e50559118ca9a3da76af6a723d4846aa61) Thanks [@abernier](https://github.com/abernier)! - The "On this page" table of contents now follows the scroll: the heading nearest the top of the
  screen is highlighted, and the first one is highlighted on load — it only changed on click before.
  It takes Vercel's docs look: a thin rail along the list, a darker segment beside the active item.
  Items indent by their depth among the headings actually present, so an h4 right under an h2 sits
  one step in, not two.

### Patch Changes

- [#601](https://github.com/pmndrs/docs/pull/601) [`0e69a2e`](https://github.com/pmndrs/docs/commit/0e69a2ef4eb04872a7b60af69b901c288de6a3e0) Thanks [@abernier](https://github.com/abernier)! - The docs navigation is now shadcn's native Sidebar. On desktop it keeps its place and look: on the
  page's own surface, the current page in a primary-container bar flush left with a rounded end,
  categories folding under a chevron, a tree line down each category's pages. Hover is a lighter tint
  of the same colour, so it no longer reads like the current page. Below `lg`, the header button
  opens the nav as a sheet from the left, which closes as soon as a page is picked.

- [#603](https://github.com/pmndrs/docs/pull/603) [`26bb0f3`](https://github.com/pmndrs/docs/commit/26bb0f3c9b6a401e8ea494f23f4ad98b51f677bf) Thanks [@abernier](https://github.com/abernier)! - Every icon on the site now comes from lucide, the icon set of the shadcn components: the header's
  GitHub and Discord links, the GitHub-style alerts, the code blocks' copy button, the nav's folding
  arrows, the mobile menu, the search and the home page's cards. They keep their sizes; `react-icons`
  is no longer a dependency.

- [#607](https://github.com/pmndrs/docs/pull/607) [`c889597`](https://github.com/pmndrs/docs/commit/c889597274f502eeaa8736b6935fa57886f44540) Thanks [@abernier](https://github.com/abernier)! - Going to another page now lands at its top with the title in view. It could stop short with the
  title hidden under the sticky header: Next's scroll to the top ran smoothly and was cut off by its
  own fallback, which lined the page up with the top of the screen, behind the header.

- [#606](https://github.com/pmndrs/docs/pull/606) [`5df604e`](https://github.com/pmndrs/docs/commit/5df604e5357e76e40dfea13b69c8223b6f9b5a40) Thanks [@abernier](https://github.com/abernier)! - Inactive "On this page" items now share the muted color of the "On this page" title, so the active
  item stands out more.

## 4.1.4

### Patch Changes

- [#602](https://github.com/pmndrs/docs/pull/602) [`1574332`](https://github.com/pmndrs/docs/commit/1574332647cda41ce3342acde1664931630168af) Thanks [@abernier](https://github.com/abernier)! - The search field sits centred in its dialog again: with nothing typed, it had twice as much room
  above it as below. Each result now shows three lines of its page instead of all of it, and the
  list fades out at its edges while scrolled.

- [#599](https://github.com/pmndrs/docs/pull/599) [`609f042`](https://github.com/pmndrs/docs/commit/609f042fcebd9ee964b346da8b0c7d7d553c97ff) Thanks [@abernier](https://github.com/abernier)! - The site's building blocks move from Radix to Base UI, on shadcn's `base-luma` style. The search
  opens as shadcn's command palette: a rounded card hung near the top, over a blurred backdrop,
  with a search icon in its field and a "No results found." line when nothing matches. Pressing
  Enter on a fresh query now always opens the first result — it could do nothing before. The mobile
  menu, the nav's folding categories and the rest look as they did.

## 4.1.3

### Patch Changes

- [#596](https://github.com/pmndrs/docs/pull/596) [`7f1acae`](https://github.com/pmndrs/docs/commit/7f1acaefb42922cc070efe4c7ae7fc71d9427b45) Thanks [@abernier](https://github.com/abernier)! - Keep MDX expressions again. next-mdx-remote 6 compiles with `blockJS: true` by default, which
  silently stripped every `{...}` — `<Grid cols={2}>`, `<Sandpack files={{...}}>`,
  `<Codesandbox tags={[...]}>` — since 3.4.2, and crashed builds whose Sandpack lost its `files`.
  The MDX is the consuming repo's own docs, read at build time, so `blockJS` is turned off;
  `blockDangerousJS` stays on.

## 4.1.2

### Patch Changes

- [#593](https://github.com/pmndrs/docs/pull/593) [`c1ae5d3`](https://github.com/pmndrs/docs/commit/c1ae5d3acd507997586a10e08cf58665637bec41) Thanks [@abernier](https://github.com/abernier)! - Read `react-postprocessing` and `a11y` in `browse` and over MCP. Both sites publish a
  `llms-full.txt` now — react-postprocessing has for a while, a11y since its build moved to v4 —
  so the flag was simply behind the world.

## 4.1.1

### Patch Changes

- [#588](https://github.com/pmndrs/docs/pull/588) [`b6081cc`](https://github.com/pmndrs/docs/commit/b6081cce0614c858691aa8590b99ef8ddd696ae0) Thanks [@abernier](https://github.com/abernier)! - Stop publishing `src/app/api`. A Route Handler cannot be statically exported, and the CLI
  already leaves it behind when it copies the app, so it only ever travelled as dead weight —
  37 kB of it, once its test is counted.

  One test file still ships, `src/app/[...slug]/page.test.ts`. Nothing under a bracketed
  directory can be excluded through `files` under `pnpm`, whatever the pattern: `npm pack` honours
  `!**/*.test.*` there, `pnpm pack` does not, and neither a directory negation nor an escaped
  bracket reaches it.

- [#590](https://github.com/pmndrs/docs/pull/590) [`a9f0ed8`](https://github.com/pmndrs/docs/commit/a9f0ed8f91757d49a321522bb689663b46c47665) Thanks [@abernier](https://github.com/abernier)! - `browse`: render markdown tables as aligned columns instead of wrapped pipes

## 4.1.0

### Minor Changes

- [#586](https://github.com/pmndrs/docs/pull/586) [`0a925e4`](https://github.com/pmndrs/docs/commit/0a925e409b0aa72137675093614cc239a8056365) Thanks [@abernier](https://github.com/abernier)! - Read the published pmndrs documentation from the terminal: `npx @pmndrs/docs`.

  Two new commands, both reading each library's published `llms-full.txt` — one GET per library, cached for an hour under `~/.cache/pmndrs-docs`, `--refresh` to fetch again:
  - `browse [target]`, the default command, is a reader: pages on the left, the page on the right, `b` folds the sidebar away, `/` searches every library at once, `o` opens the page in a browser. A target lands straight where it points — `drei`, `drei/performances/instances`, or a query.
  - `search <query>` is the same search with no screen: one result per line on stdout, in the `{lib} {path} - {title}` shape the MCP server publishes its index in, so a pipe or an agent can read it. `--in` narrows to a library, or to the matching lines of a single page.

  Outside a terminal `browse` writes the page it was pointed at to stdout, rather than opening anything.

  `build` is unaffected, and does not pay for this: the terminal UI is loaded only when the reader opens. It does add `ink` to the package's dependencies, so every install pulls it.

### Patch Changes

- [#585](https://github.com/pmndrs/docs/pull/585) [`5fb7cbb`](https://github.com/pmndrs/docs/commit/5fb7cbb35edf4c5396b7e50402309cbd7d6b8601) Thanks [@abernier](https://github.com/abernier)! - Move the `libs` registry out of `src/app/page.tsx` and into `src/libs.ts`, a module with no Next imports.

  The page keeps the icon imports and pairs them with the entries it renders; the MCP route reads the plain module instead of importing a page backwards. Anything that is not a browser — a script, a test, the CLI — can now read the registry.

## 4.0.1

### Patch Changes

- [#583](https://github.com/pmndrs/docs/pull/583) [`24741a2`](https://github.com/pmndrs/docs/commit/24741a254bb08f2d85d247cc9a6dca058824be5a) Thanks [@abernier](https://github.com/abernier)! - Document `npx @pmndrs/docs@latest` rather than `npx @pmndrs/docs`. Without a version, `npx`
  reuses whatever it already has in its cache, so a copy from weeks ago wins silently and the
  command appears not to have changed.

## 4.0.0

### Major Changes

- [#577](https://github.com/pmndrs/docs/pull/577) [`3e23829`](https://github.com/pmndrs/docs/commit/3e238294a73e617b1dca7361d45bfc8a8bb221fa) Thanks [@abernier](https://github.com/abernier)! - Drop Docker. `npx @pmndrs/docs build` does the same build, so the image, the `Dockerfile` and
  the publish steps that maintained them are gone. `ghcr.io/pmndrs/docs` stops being pushed —
  its existing tags stay in the registry, frozen.

  Major because of the git tag, not the inputs: releases force-move `vX`, so anything short of a
  major would slide every caller pinning `build.yml@v3` onto the Docker-free workflow. `@v3`
  keeps building through the image until its repository moves to `@v4`.

  `build.yml` itself keeps every input, every environment variable and the same Pages artifact.
  Only the build step changes, and `docker_tag` gives way to `version` — an npm version or range.

  The job keeps `id-token: write` — no longer to attest a Docker image, now to sign the npm
  publish with trusted publishing.

  `preview.sh` builds through the CLI too, and reads its options straight from the environment
  rather than forwarding each one into a container.

### Minor Changes

- [#574](https://github.com/pmndrs/docs/pull/574) [`e70f51e`](https://github.com/pmndrs/docs/commit/e70f51e30cc36024987d57e13c14064cfd6d8071) Thanks [@abernier](https://github.com/abernier)! - Publish the generator to npm, as `npx @pmndrs/docs build`.

  `--format website` statically exports the documentation site.
  `--format fragment` — the default — compiles MDX to plain HTML with no layout, stylesheet or
  script, either from a folder or from stdin, and needs nothing but node.

  `bin/build.mjs` is gone: it was never published, and built a server bundle rather than a
  static export.

### Patch Changes

- [#575](https://github.com/pmndrs/docs/pull/575) [`4a68fbd`](https://github.com/pmndrs/docs/commit/4a68fbd50b0151b55009b483961780f29ef7c565) Thanks [@abernier](https://github.com/abernier)! - Stop repeating the Sandpack stylesheet on every streamed chunk

  `useServerInsertedHTML` is called back on each flush of the response and expects what is new
  since the last one, but the callback returned the whole Sandpack stylesheet every time. Pages
  carried one full copy per chunk — 145 identical copies of the same 8.9 kB on the worst of
  them, three quarters of the page weight.

  Which pages were hit moved from build to build: the stylesheet is a module-level singleton,
  so it depended on whether a page using Sandpack had been rendered earlier in the same build
  process. Pages with no Sandpack of their own paid for their neighbours.

## 3.5.0

### Minor Changes

- [#562](https://github.com/pmndrs/docs/pull/562) [`8415ecf`](https://github.com/pmndrs/docs/commit/8415ecfb9de76e7b5f64583c83fb60ba3cb97f54) Thanks [@abernier](https://github.com/abernier)! - Serve the pmndrs example gallery over MCP, next to the docs: an `examples://index` resource listing every published demo with its description, libraries and tags, and a `get_example` tool returning one demo in full -- source files, the dependency versions it is written against, and asset attribution. Reads the JSON catalog pmndrs/examples publishes at `/catalog/`; override the origin with `EXAMPLES_URL` to develop against a local build.

### Patch Changes

- [#565](https://github.com/pmndrs/docs/pull/565) [`3272ad5`](https://github.com/pmndrs/docs/commit/3272ad5596bf84a511b855585395a2cca9b5a950) Thanks [@abernier](https://github.com/abernier)! - Follow the examples gallery to guessable URLs: an example's document is now its page URL with `.md` on the end (`/examples/caustics.md`), and the gallery index is `/llms.txt` — the same root convention every site built with this generator already publishes. `index` no longer needs reserving as a name, since it no longer collides with anything.

- [#564](https://github.com/pmndrs/docs/pull/564) [`2318b88`](https://github.com/pmndrs/docs/commit/2318b8815791d942e67b3adf3bf8daa339ece7d7) Thanks [@abernier](https://github.com/abernier)! - Pass the example gallery through as published rather than rendering it here. `pmndrs/examples` now writes the documents at build time and links each one from its page with `rel="alternate"`, so `examples://index` and `get_example` hand on the same text an agent would get from the open web — one rendering instead of two that could drift. The agents page documents both tools.

- [#572](https://github.com/pmndrs/docs/pull/572) [`96c442f`](https://github.com/pmndrs/docs/commit/96c442fdc30a29fc6222199096d0cc13a1d64e86) Thanks [@abernier](https://github.com/abernier)! - `globals.css` stops restating the colour layer by hand. The ~60-line `@theme` mapping is now `@plugin 'material-theme-builder/tailwind'`, which declares the same names and takes the five alert colours as an option; the 31-line shadcn remap is now `@import 'material-theme-builder/shadcn.css'`, which is where those exact 31 declarations came from. 95 lines removed, nothing to keep in sync.

- [#572](https://github.com/pmndrs/docs/pull/572) [`96c442f`](https://github.com/pmndrs/docs/commit/96c442fdc30a29fc6222199096d0cc13a1d64e86) Thanks [@abernier](https://github.com/abernier)! - Move the colour engine from `react-mcu` to [`material-theme-builder`](https://github.com/abernier/material-theme-builder), its successor. At the API level it is a rename: `--mcu-*` becomes `--md-sys-color-*`, the standard MD3 system-token name. The `--color-*` names the `@theme` mapping declares are unchanged, so every `bg-surface`, `bg-primary-container` and `text-on-surface-variant` keeps working untouched, and the `THEME_*` env vars behave exactly as before.

  The palette is not quite identical, though. 57 of the 67 roles match exactly, including all 49 standard M3 ones; the 10 that differ all belong to the five `blend: true` custom colours, which the two packages harmonize differently. In practice the markdown alerts get more muted backgrounds — most visibly **Important** and **Caution**, whose hues sit furthest from the seed. **Tip** and **Warning** are unchanged.

  Two components name the raw variables rather than a Tailwind utility — `Code` for its fixed prism colour, `Sandpack` for its three surface levels — and are the only component edits.

## 3.4.4

### Patch Changes

- [`6eb0168`](https://github.com/pmndrs/docs/commit/6eb0168a0ffea3240fc8a10b6263a2c84e082162) Thanks [@abernier](https://github.com/abernier)! - Cut a GitHub release alongside the version tags, and drop `[skip ci]` from the version commit

## 3.4.3

### Patch Changes

- [`71835e7`](https://github.com/pmndrs/docs/commit/71835e7dba09715ba75359058d2a718f28a820b4) Thanks [@abernier](https://github.com/abernier)! - Bump GitHub Pages actions to Node.js 24 runtimes

## 3.4.2

### Patch Changes

- [#551](https://github.com/pmndrs/docs/pull/551) [`2f35751`](https://github.com/pmndrs/docs/commit/2f357512cc318727d2a081810031d6a1a0f24cbc) Thanks [@abernier](https://github.com/abernier)! - Add an MCP server install section on the home page (Claude Code shortcut + JSON config for other clients, link to the MCP remote-servers spec, mention of per-lib `llms.txt`). Also bundles the earlier MCP server URL / client configuration fix.

## 3.4.1

### Patch Changes

- [#539](https://github.com/pmndrs/docs/pull/539) [`98ee42e`](https://github.com/pmndrs/docs/commit/98ee42e3cd52bc5ff769675decc2ef966965c6d3) Thanks [@abernier](https://github.com/abernier)! - escaping issue fixed

## 3.4.0

### Minor Changes

- [#531](https://github.com/pmndrs/docs/pull/531) [`619559b`](https://github.com/pmndrs/docs/commit/619559b2bdb012d7401159a9df4d86de8ec1e7a1) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - mcp support

## 3.3.2

### Patch Changes

- [`a0deaab`](https://github.com/pmndrs/docs/commit/a0deaab2f7bf19a565dbee723e136650c06abc9f) Thanks [@abernier](https://github.com/abernier)! - docker_tag 3

## 3.3.1

### Patch Changes

- [#527](https://github.com/pmndrs/docs/pull/527) [`0119134`](https://github.com/pmndrs/docs/commit/0119134cb25e8166dabff935838beafe29cfbdb7) Thanks [@abernier](https://github.com/abernier)! - entries

## 3.3.0

### Minor Changes

- [#525](https://github.com/pmndrs/docs/pull/525) [`7e6d0f1`](https://github.com/pmndrs/docs/commit/7e6d0f1b611919d157066343e393ab237c26b364) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - frontmatter md support

## 3.2.3

### Patch Changes

- [`23d3a9a`](https://github.com/pmndrs/docs/commit/23d3a9aafdf459356f7564a45951696ca340ad0e) Thanks [@abernier](https://github.com/abernier)! - order

## 3.2.2

### Patch Changes

- [`8d1012b`](https://github.com/pmndrs/docs/commit/8d1012b1fa8d1c08757931c3af5447071a8b3b0f) Thanks [@abernier](https://github.com/abernier)! - rehypeLink

## 3.2.1

### Patch Changes

- [`933b964`](https://github.com/pmndrs/docs/commit/933b964ecac027ab3efb43b863b8a80a30f63caa) Thanks [@abernier](https://github.com/abernier)! - basePath for llms

## 3.2.0

### Minor Changes

- [#513](https://github.com/pmndrs/docs/pull/513) [`115aa47`](https://github.com/pmndrs/docs/commit/115aa4767d12db20a5e0e56ba9f825f6a4486acf) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - llms.txt

## 3.1.8

### Patch Changes

- [`25a0b47`](https://github.com/pmndrs/docs/commit/25a0b47b2be0a0f1a7cb880fb3499b9d63b24507) Thanks [@abernier](https://github.com/abernier)! - mermaid

## 3.1.7

### Patch Changes

- [#476](https://github.com/pmndrs/docs/pull/476) [`c0e0ac7`](https://github.com/pmndrs/docs/commit/c0e0ac747e6e647940df7345ca4b7eade8cc3d50) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - tags

## 3.1.6

### Patch Changes

- [`067c88f`](https://github.com/pmndrs/docs/commit/067c88fbbfca23749052cd7bc4bbef109dbb3ead) Thanks [@abernier](https://github.com/abernier)! - exit 1 preview

## 3.1.5

### Patch Changes

- [`0951299`](https://github.com/pmndrs/docs/commit/095129924f136605f44d0e16863a58891b1d3e9b) Thanks [@abernier](https://github.com/abernier)! - blah

## 3.1.4

### Patch Changes

- [`6ae693b`](https://github.com/pmndrs/docs/commit/6ae693bf422472c3d407e3734cc97c39ecb3977d) Thanks [@abernier](https://github.com/abernier)! - -private

## 3.1.3

### Patch Changes

- [`f0dba7d`](https://github.com/pmndrs/docs/commit/f0dba7d1e23df953f43356f09e075ff71ebfcc08) Thanks [@abernier](https://github.com/abernier)! - new ci

## 3.1.2

### Patch Changes

- [`11418e2`](https://github.com/pmndrs/docs/commit/11418e2ca9cc3098137e3335d9fcfff69996a0ae) Thanks [@abernier](https://github.com/abernier)! - tweaks

## 3.1.1

### Patch Changes

- [`ff2e91e`](https://github.com/pmndrs/docs/commit/ff2e91ec6ad28af1aa9f0faf5034c2448ab191bb) Thanks [@abernier](https://github.com/abernier)! - pnpm

## 3.1.0

### Minor Changes

- [#424](https://github.com/pmndrs/docs/pull/424) [`730c1c8`](https://github.com/pmndrs/docs/commit/730c1c8aa2274ac43410b21a26c81db7393ea464) Thanks [@krispya](https://github.com/krispya)! - Add Mermaid diagram support

### Patch Changes

- [#427](https://github.com/pmndrs/docs/pull/427) [`dc1bbc2`](https://github.com/pmndrs/docs/commit/dc1bbc263fc7d1c5e6fb04c10366aa6f94263810) Thanks [@krispya](https://github.com/krispya)! - Fixed duplicate React key error in Contributors component fallback

- [#427](https://github.com/pmndrs/docs/pull/427) [`e0f5446`](https://github.com/pmndrs/docs/commit/e0f54468c2020d92da879a37001114b02f4e4d54) Thanks [@krispya](https://github.com/krispya)! - Fixed deprecation warning by replacing url.parse() with WHATWG URL API

## 3.0.0

### Major Changes

- [#418](https://github.com/pmndrs/docs/pull/418) [`7d84d48`](https://github.com/pmndrs/docs/commit/7d84d48ebfe3fc57fb13b040f80a309100735e62) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add docs.yml workflow for GitHub Pages deployment

## 2.20.14

### Patch Changes

- [#415](https://github.com/pmndrs/docs/pull/415) [`646df64`](https://github.com/pmndrs/docs/commit/646df649a03ca966d00e0e0d7da5ca6bc8515a04) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Configure changesets to automatically create GitHub releases and git tags

## 2.20.13

### Patch Changes

- 1e10bd0: Add optional docker_tag input to build.yml workflow

## 2.20.12

### Patch Changes

- 699c2d1: 2.20.1

## 2.20.11

### Patch Changes

- 88e07a7: Update Docker image to version 2.20.4

## 2.20.10

### Patch Changes

- b913620: Upgrade to Node 24

## 2.20.9

### Patch Changes

- d6d2a74: KeypointsItem

## 2.20.8

### Patch Changes

- 23f7338: -v

## 2.20.7

### Patch Changes

- 2cd4acb: bump

## 2.20.6

### Patch Changes

- 1a24129: Fix release workflow to use hasChangesets output for private packages

## 2.20.5

### Patch Changes

- 19fc260: fix package.json version

## 0.1.1

### Patch Changes

- b2337a4: Switch from semantic-release to changesets for version management
