[![](https://img.shields.io/badge/chromatic-171c23.svg?style=flat&colorA=000000&colorB=000000&logo=chromatic&logoColor=ffffff)](https://www.chromatic.com/library?appId=696fd126f0e504f96615dec9&branch=main)

[![](docs/getting-started/gutenberg.jpg)](docs/getting-started/introduction.mdx)

[docs/getting-started/introduction.mdx](docs/getting-started/introduction.mdx)

# Usage

```sh
$ curl -sL https://raw.githubusercontent.com/pmndrs/docs/refs/heads/main/preview.sh | \
  MDX="docs" \
  ICON="🥑" \
  DOCKER_IMAGE="ghcr.io/pmndrs/docs:latest" \
  sh
```

- you can pass any option from [configuration](docs/getting-started/introduction.mdx#Configuration)
- in `DOCKER_IMAGE`, you can specify any `:tag` value from [docs packages](https://github.com/pmndrs/docs/pkgs/container/docs) container registry

# Development

## Storybook

Storybook is set up to develop and test MDX components in isolation. All MDX components are available in the Storybook UI with various examples and interactive controls.

To run Storybook locally:

```sh
$ pnpm storybook
```

This will start Storybook on [http://localhost:6006](http://localhost:6006).

To build Storybook for production:

```sh
$ pnpm build-storybook
```

### Available Components

The following MDX components are available in Storybook:

- **Grid** - Responsive grid layout for organizing content (2, 3, or 4 columns)
- **GitHub Alerts** - Styled alert boxes (Note, Tip, Important, Warning, Caution)
- **Keypoints** - Highlighted key points section with bullet list
- **Details** - Collapsible content sections
- **Intro** - Introduction paragraph with larger text
- **Code** - Code blocks with syntax highlighting and copy functionality

# Test

Visual tests are performed in the cloud, through [chromatic.yml](.github/workflows/chromatic.yml).

<details>

You can also replay locally:

```sh
$ npx playwright test --update-snapshots
$ npx chromatic --playwright --project-token $CHROMATIC_PROJECT_TOKEN
```

</details>
