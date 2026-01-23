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

# Test

Visual tests are performed in the cloud, through [chromatic.yml](.github/workflows/chromatic.yml).

<details>

You can also replay locally:

```sh
$ npx playwright test --update-snapshots
$ npx chromatic --playwright --project-token $CHROMATIC_PROJECT_TOKEN
```

</details>
