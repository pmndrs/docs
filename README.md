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

See [read](docs/getting-started/introduction.mdx#read) for keys, `search` and caching.

## Build

```sh
$ cat foo.mdx | npx @pmndrs/docs@latest build               # one HTML fragment, on stdout
$ npx @pmndrs/docs@latest build docs out                    # one .html per .mdx, assets alongside
$ npx @pmndrs/docs@latest build docs out --format website   # the whole website, statically exported
```

See [CLI](docs/getting-started/introduction.mdx#cli) for formats, flags and `docs.config.ts`.

<details>
<summary>Preview a folder of MDX, served</summary>

```sh
$ curl -sL https://raw.githubusercontent.com/pmndrs/docs/refs/heads/main/preview.sh | \
  MDX="docs" \
  ICON="🥑" \
  sh
```

Builds the website, then serves it — alongside the MDX folder itself, so relative assets
resolve while you edit. Any option from
[configuration](docs/getting-started/introduction.mdx#configuration) goes in the same way, and
`VERSION` picks a published version of the CLI.

</details>

# Releasing

Every push to `main` redeploys [docs.pmnd.rs](https://docs.pmnd.rs) via [ci.yml](.github/workflows/ci.yml) — no [changeset](.changeset/) needed for that.

Add one (`pnpm changeset`) only when downstream consumers pinning `pmndrs/docs/.github/workflows/build.yml@v4` or `@pmndrs/docs@4` should pull the change. It bumps [`package.json`](package.json), publishes to npm, and tags `vX.Y.Z` + `vX` — so `@v4` resolves to the latest.

TL;DR — site-only tweak: skip. Anything consumers see (workflow, build behavior, templates): add one.

# Test

Visual tests are performed in the cloud, through [chromatic-storybook.yml](.github/workflows/chromatic-storybook.yml).

- `pnpm run lgtm` — the gate CI runs ([lgtm.yml](.github/workflows/lgtm.yml)): types, lint, registry validation, unit tests.
