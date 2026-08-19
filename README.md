[![](https://img.shields.io/badge/docs--playwright-171c23.svg?style=flat&colorA=000000&colorB=000000&logo=chromatic&logoColor=ffffff)](https://www.chromatic.com/library?appId=696fd126f0e504f96615dec9&branch=main)
[![](https://img.shields.io/badge/docs--storybook-171c23.svg?style=flat&colorA=000000&colorB=000000&logo=chromatic&logoColor=ffffff)](https://www.chromatic.com/library?appId=6977e41687a50b30c4349650&branch=main)

[![](docs/getting-started/gutenberg.jpg)](docs/getting-started/introduction.mdx)

[docs/getting-started/introduction.mdx](docs/getting-started/introduction.mdx)

# Usage

## Read

```sh
$ npx @pmndrs/docs                                 # the reader: every library, every page
$ npx @pmndrs/docs drei                            # straight into one
$ npx @pmndrs/docs drei/performances/instances     # straight to a page
$ npx @pmndrs/docs search instanced mesh           # one result per line, on stdout
```

`↑↓` drives whichever pane has the focus — the list of pages, or the page itself. `⏎` or `⇥`
hands the focus over, `esc` or `⇥` hands it back, and the lit border says where it is — the
wheel moves whichever pane it points at, focus or no focus. `←→` changes library, `b` folds the sidebar away, `/` searches every library at once, `o` opens the
page in a browser, `q` quits. Links inside a page are clickable wherever the terminal honours
OSC 8 hyperlinks — iTerm2, Ghostty, WezTerm, Kitty, Windows Terminal.

`search` is the half a pipe or an agent can use: results read `{lib} {path} - {title}`, the
shape the [MCP server](https://docs.pmnd.rs) publishes its index in, and nothing found exits 1.
`--in drei` narrows to one library, `--in drei/performances/instances` to the matching lines of
one page.

Both read the published `llms-full.txt` of each library, cached for an hour under
`~/.cache/pmndrs-docs` — `--refresh` fetches again. Outside a terminal, a page target is
written to stdout, so `npx @pmndrs/docs drei/performances/instances | glow` works.

## Write

```sh
$ npx @pmndrs/docs@latest dev docs --libname "React Three Fiber" --icon 🥑
```

Serves the website on http://localhost:3000, reading the MDX folder on every request — edit a
page, reload. The folder is served alongside, so relative assets resolve while you write, and
`--port` moves the server. Every website option `build` takes, `dev` takes too.

Each of them falls back to the environment variable it maps to — the ones
[`build.yml`](.github/workflows/build.yml) sets — and a `.env` in the folder you run from is
read into the environment, so `npx @pmndrs/docs@latest dev` alone is enough once written down.
[`.env`](.env) is this repository's own website.

## Build

```sh
$ cat foo.mdx | npx @pmndrs/docs@latest build               # one HTML fragment, on stdout
$ npx @pmndrs/docs@latest build docs out                    # one .html per .mdx, assets alongside
$ npx @pmndrs/docs@latest build docs out --format website   # the whole website, statically exported
```

`--format fragment` (the default) needs nothing but node — no `next build`, no bundler. A
fragment is the compiled MDX and nothing else: no layout, no stylesheet, no script. Mermaid
diagrams stay fenced blocks, and Sandpack shows its code without the editor.

`dev --help` and `build --help` list every website option — `--libname`, `--base-path`, `--icon`, `--theme-*`… Each
one falls back to the environment variable it maps to, the same ones
[configuration](docs/getting-started/introduction.mdx#Configuration) documents.

# Releasing

Every push to `main` redeploys [docs.pmnd.rs](https://docs.pmnd.rs) via [ci.yml](.github/workflows/ci.yml) — no [changeset](.changeset/) needed for that.

Add one (`pnpm changeset`) only when downstream consumers pinning `pmndrs/docs/.github/workflows/build.yml@v4` or `@pmndrs/docs@4` should pull the change. It bumps [`package.json`](package.json), publishes to npm, and tags `vX.Y.Z` + `vX` — so `@v4` resolves to the latest.

TL;DR — site-only tweak: skip. Anything consumers see (workflow, build behavior, templates): add one.

# Test

Visual tests are performed in the cloud, through [chromatic.yml](.github/workflows/chromatic.yml).

<details>

You can also replay locally:

```sh
$ npx playwright test --update-snapshots
$ npx chromatic --playwright --project-token $CHROMATIC_PROJECT_TOKEN
```

</details>
