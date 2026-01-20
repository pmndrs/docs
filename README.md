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
- you can specify any Docker image and tag via `DOCKER_IMAGE` (e.g., `ghcr.io/pmndrs/docs:v1.0.0`) from [docs packages](https://github.com/pmndrs/docs/pkgs/container/docs) container registry
