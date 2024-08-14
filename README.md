# Configuration

| var                     | description                                                                                                                                                              | example                                                                                  | default |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------- |
| `MDX`\*                 | Path to `*.mdx` folder<br>NB: can be relative or absolute                                                                                                                | `docs` or `~/code/myproject/documentation`                                               | none    |
| `NEXT_PUBLIC_LIBNAME`\* | Library name                                                                                                                                                             | `React Three Fiber`                                                                      | none    |
| `BASE_PATH`             | Base path for the final URL                                                                                                                                              | `/react-three-fiber`                                                                     | none    |
| `DIST_DIR`              | Path to the output folder ([within project](https://nextjs.org/docs/app/api-reference/next-config-js/distDir#:~:text=should%20not%20leave%20your%20project%20directory)) | `out` or `docs/out/react-three-fiber`                                                    | none    |
| `OUTPUT`                | Set to `export` for static output                                                                                                                                        | `export`                                                                                 | none    |
| `HOME_REDIRECT`         | Where the home should redirect                                                                                                                                           | `/getting-started/introduction`                                                          | none    |
| `INLINE_IMAGES_ORIGIN`  | [Origin](https://developer.mozilla.org/en-US/docs/Web/API/URL/origin) for inlining relative images                                                                       | `http://localhost:60141`or `https://github.com/pmndrs/react-three-fiber/raw/master/docs` | none    |
| `EDIT_ORIGIN`           | [Origin](https://developer.mozilla.org/en-US/docs/Web/API/URL/origin) for displaying "Edit this page" URLs                                                               | `https://github.com/pmndrs/react-three-fiber/edit/master/docs`                           | none    |
| `NEXT_PUBLIC_URL`       | Final URL of the published website                                                                                                                                       | `https://pmndrs.github.io/react-three-fiber`                                             | none    |

\* Required

Details:

- `INLINE_IMAGES_ORIGIN`:

  Given a `advanced/introduction.mdx` file in the `MDX` folder:

  ```mdx
  ![](dog.png)
  ```

  becomes (for a `INLINE_IMAGES_ORIGIN=http://localhost:60141` value):

  ```mdx
  ![](http://localhost:60141/advanced/dog.png)
  ```

  `http://localhost:60141` is the `MDX` folder served.

  > [!TIP]
  > When deployed on GitHub Pages, `INLINE_IMAGES_ORIGIN` will typically value something like `https://github.com/pmndrs/uikit/raw/main/docs`, thanks to [`build.yml`](.github/workflows/build.yml) rule.

# dev

```sh
$ (
  trap 'kill -9 0' SIGINT

  export _PORT=60141

  # [Config](https://github.com/pmndrs/docs#configuration)
  export MDX=~/code/pmndrs/react-three-fiber/docs
  export NEXT_PUBLIC_LIBNAME="React Three Fiber"
  export BASE_PATH=
  export DIST_DIR=
  export OUTPUT=export
  export HOME_REDIRECT=/getting-started/introduction
  export INLINE_IMAGES_ORIGIN=http://localhost:$_PORT
  export EDIT_ORIGIN="vscode://file/$MDX"
  export NEXT_PUBLIC_URL=

  kill $(lsof -ti:"$_PORT")
  npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &
  npm run dev &

  wait
)
```

Then go to: http://localhost:3000

> [!TIP]
> If `HOME_REDIRECT=` empty, `/` will not redirect, and instead displays an index of libraries.

# build

```sh
$ (
  trap 'kill -9 0' SIGINT

  rm -rf out

  export _PORT=60141

  # [Config](https://github.com/pmndrs/docs#configuration)
  export MDX=~/code/pmndrs/react-three-fiber/docs
  export NEXT_PUBLIC_LIBNAME="React Three Fiber"
  export BASE_PATH=
  export DIST_DIR=
  export OUTPUT=export
  export HOME_REDIRECT=/getting-started/introduction
  export INLINE_IMAGES_ORIGIN=http://localhost:$_PORT
  export EDIT_ORIGIN=
  export NEXT_PUBLIC_URL=

  npm run build

  kill $(lsof -ti:"$_PORT")
  npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &
  npx serve out &

  wait
)
```

http://localhost:3000

# Docker

```sh
$ docker build -t pmndrs-docs .
```

```sh
$ cd ~/code/pmndrs/react-three-fiber
$ (
  trap 'kill -9 0' SIGINT

  export _PORT=60141

  # [Config](https://github.com/pmndrs/docs#configuration)
  export MDX=./docs
  export NEXT_PUBLIC_LIBNAME="React Three Fiber"
  export BASE_PATH=
  export OUTPUT=export
  export HOME_REDIRECT=/getting-started/introduction
  export INLINE_IMAGES_ORIGIN=http://localhost:$_PORT
  export EDIT_ORIGIN=
  export NEXT_PUBLIC_URL=

  rm -rf "$MDX/out"

  docker run --rm --init -it \
    -v "$MDX":/app/docs \
    -e MDX \
    -e NEXT_PUBLIC_LIBNAME \
    -e BASE_PATH \
    -e DIST_DIR="$MDX/out$BASE_PATH" \
    -e OUTPUT \
    -e HOME_REDIRECT \
    -e INLINE_IMAGES_ORIGIN \
    -e EDIT_ORIGIN \
    -e NEXT_PUBLIC_URL \
    pmndrs-docs npm run build

  kill $(lsof -ti:"$_PORT")
  npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &
  npx -y serve "$MDX/out" &

  wait
)
```

Then go to: http://localhost:3000

# Reusable GitHub Actions workflow

`pmndrs/docs` provides a [`build.yml`](.github/workflows/build.yml) reusable workflow, any project can use:

```yml
uses: pmndrs/docs/.github/workflows/build.yml@app-router
  with:
    mdx: './docs'
    libname: 'React Three Fiber'
    home_redirect: '/getting-started/introduction'
```

See [`pmndrs/react-three-fiber/.github/workflows/docs.yml`](https://github.com/pmndrs/react-three-fiber/blob/master/.github/workflows/docs.yml) for an example implementation.

# Authoring

```mdx
---
title: TITLE
description: DESCRIPTION
image: IMAGE
---

MARKDOWN
```

## Frontmatter

Any key is optional.

- `TITLE`: if not provided, last part of the path like: `/advanced/hello-there` -> `hello there`
- `IMAGE`:
  - accepts relative (to the md file) paths, absolute, eg: `dog.png`, `./dog.png`, `../dog.png`, `/dog.png` or `https://animals.com/dog.png`
  - will be used as metadata image if provided

## MARKDOWN

TODO
