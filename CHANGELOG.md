# @pmndrs/docs

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
