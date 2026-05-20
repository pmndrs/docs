[![](https://img.shields.io/badge/docs--playwright-171c23.svg?style=flat&colorA=000000&colorB=000000&logo=chromatic&logoColor=ffffff)](https://www.chromatic.com/library?appId=696fd126f0e504f96615dec9&branch=main)
[![](https://img.shields.io/badge/docs--storybook-171c23.svg?style=flat&colorA=000000&colorB=000000&logo=chromatic&logoColor=ffffff)](https://www.chromatic.com/library?appId=6977e41687a50b30c4349650&branch=main)

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

# Releasing

Every push to `main` auto-deploys [docs.pmnd.rs](https://docs.pmnd.rs) (Vercel). **No changeset needed** for the site to refresh.

A changeset is needed when downstream consumers of this package should pull the change too — i.e. projects using:

```yaml
uses: pmndrs/docs/.github/workflows/build.yml@v3
# or
DOCKER_IMAGE: ghcr.io/pmndrs/docs:v3
```

They follow the `@vX` major tag, which only moves when a new version is published. Adding a changeset triggers the release flow: version bump in `package.json`, `vX.Y.Z` + `vX` git tags, and a matching Docker image — so `@v3` resolves to the latest.

```sh
$ pnpm changeset    # creates .changeset/<slug>.md, pick `patch` / `minor` / `major`
```

TL;DR — add a changeset if your PR changes anything that consumers should see (templates, workflow, build behavior). Skip it for site-only tweaks.

# Test

Visual tests are performed in the cloud, through [chromatic.yml](.github/workflows/chromatic.yml).

<details>

You can also replay locally:

```sh
$ npx playwright test --update-snapshots
$ npx chromatic --playwright --project-token $CHROMATIC_PROJECT_TOKEN
```

</details>
