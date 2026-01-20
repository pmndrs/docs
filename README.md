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

This project uses [Chromatic](https://www.chromatic.com/) for visual regression testing on Next.js pages and components.

### Running Storybook Locally

```sh
pnpm storybook
```

This starts Storybook on [http://localhost:6006](http://localhost:6006).

### Building Storybook

```sh
pnpm build-storybook
```

### CI Integration

Chromatic runs automatically on:

- Pull requests - to catch visual regressions
- Main branch pushes - baselines are auto-accepted

To set up Chromatic for this repository:

1. Create a project at [chromatic.com](https://www.chromatic.com/)
2. Add `CHROMATIC_PROJECT_TOKEN` as a repository secret in GitHub Settings
