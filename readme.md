| var                     | description                                                                                                                                                                                                                                                                                              | default |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MDX`\*                 | Path to `*.mdx` folder<br>NB: can be relative or absolute                                                                                                                                                                                                                                                | none    |
| `NEXT_PUBLIC_LIBNAME`\* | Library name                                                                                                                                                                                                                                                                                             | none    |
| `BASE_PATH`             | Base path for the final URL                                                                                                                                                                                                                                                                              | none    |
| `DIST_DIR`              | Path to the output folder                                                                                                                                                                                                                                                                                | none    |
| `OUTPUT`                | Set to `export` for static `out`put                                                                                                                                                                                                                                                                      | none    |
| `HOME_REDIRECT`         | Where the home should redirect                                                                                                                                                                                                                                                                           | none    |
| `INLINE_IMAGES_ORIGIN`  | [Origin](https://developer.mozilla.org/en-US/docs/Web/API/URL/origin) for inlining relative images<br>Eg: in a `/advanced/introduction.mdx` file, `<img src="./dog.png" />` becomes `<img src="https://github.com/pmndrs/uikit/raw/main/advanced/dog.png" />`<br> NB: if none, don't use relative images | none    |

\* Required

# dev

```sh
$ MDX=~/code/pmndrs/react-three-fiber/docs \
  NEXT_PUBLIC_LIBNAME="React Three Fiber" \
  BASE_PATH= \
  DIST_DIR= \
  OUTPUT=export \
  HOME_REDIRECT=/getting-started/introduction \
  INLINE_IMAGES_ORIGIN= \
    npm run dev
```

Then go to: http://localhost:3000

> [!TIP]
> If `HOME_REDIRECT=` empty, `/` will not redirect, and instead displays an index of libraries.

# build

```sh
$ rm -rf out; \
  \
  MDX=~/code/pmndrs/react-three-fiber/docs \
  NEXT_PUBLIC_LIBNAME="React Three Fiber" \
  BASE_PATH= \
  DIST_DIR= \
  OUTPUT=export \
  HOME_REDIRECT=/getting-started/introduction \
  INLINE_IMAGES_ORIGIN= \
    npm run build && \
  \
  npx serve out
```

http://localhost:3000/getting-started/introduction

# Docker

```sh
$ docker build -t pmndrs-docs .
```

```sh
$ cd ~/code/pmndrs/react-three-fiber
$ export BASE_PATH=/react-three-fiber; \
  export MDX=./docs; \
  export NEXT_PUBLIC_LIBNAME="React Three Fiber"; \
  export OUTPUT=export; \
  export HOME_REDIRECT=/getting-started/introduction; \
  export INLINE_IMAGES_ORIGIN=; \
  \
  rm -rf "$MDX/out"; \
  \
  docker run --rm --init -it \
    -v "$MDX":/app/docs \
    -e BASE_PATH \
    -e DIST_DIR="$MDX/out$BASE_PATH" \
    -e MDX \
    -e NEXT_PUBLIC_LIBNAME \
    -e OUTPUT \
    -e HOME_REDIRECT \
    -e INLINE_IMAGES_ORIGIN \
    pmndrs-docs npm run build && \
  \
  npx -y serve "$MDX/out"
```

Then go to: http://localhost:3000/react-three-fiber

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
