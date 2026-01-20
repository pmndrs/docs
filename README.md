[![](docs/getting-started/gutenberg.jpg)](docs/getting-started/introduction.mdx)

[docs/getting-started/introduction.mdx](docs/getting-started/introduction.mdx)

# Usage

```sh
$ curl -sL https://raw.githubusercontent.com/pmndrs/docs/refs/heads/main/preview.sh | \
  MDX="docs" \
  ICON="🥑" \
  DOCKER_TAG="latest" \
  sh
```

- you can pass any option from [configuration](docs/getting-started/introduction.mdx#Configuration)
- you can specify any `DOCKER_TAG` value from [docs packages](https://github.com/pmndrs/docs/pkgs/container/docs) container registry

## Visual Testing with Chromatic

This project uses [Chromatic](https://www.chromatic.com/) with Playwright for visual regression testing on Next.js pages.

### How it works

Instead of traditional screenshot-based testing, this setup uses Chromatic's DOM snapshot approach:

1. **Playwright tests** capture the DOM structure (HTML, CSS, computed styles) using `@chromatic-com/playwright`
2. **Chromatic cloud** receives the DOM snapshots and renders them in consistent browser environments
3. **Visual comparisons** are made in the cloud, ensuring pixel-perfect consistency across all platforms

### Running tests locally

```sh
pnpm test
```

This runs Playwright tests that capture DOM snapshots for Chromatic.

### CI Integration

Chromatic runs automatically on:

- Pull requests - to catch visual regressions
- Main branch pushes - baselines are auto-accepted

The workflow:

1. Runs Playwright tests to generate DOM snapshots
2. Uploads snapshots to Chromatic for cloud rendering
3. Reports visual changes back to the PR

### Setup

To set up Chromatic for this repository:

1. Create a project at [chromatic.com](https://www.chromatic.com/)
2. Add `CHROMATIC_PROJECT_TOKEN` as a repository secret in GitHub Settings
