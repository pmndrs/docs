[![](docs/getting-started/gutenberg.jpg)](docs/getting-started/introduction.mdx)

[docs/getting-started/introduction.mdx](docs/getting-started/introduction.mdx)

# Usage

## Via npm

```sh
npx -y @pmndrs/docs build ./docs --libname="Your Library" --basePath="/your-path"
```

## Via Docker

```sh
$ curl -sL https://raw.githubusercontent.com/pmndrs/docs/refs/heads/main/preview.sh | \
  MDX="docs" \
  ICON="🥑" \
  DOCKER_TAG="latest" \
  sh
```

- you can pass any option from [configuration](docs/getting-started/introduction.mdx#Configuration)
- you can specify any `DOCKER_TAG` value from [docs packages](https://github.com/pmndrs/docs/pkgs/container/docs) container registry
