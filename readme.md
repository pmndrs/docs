```sh
$ MDX=~/code/pmndrs/react-three-fiber/docs NEXT_PUBLIC_LIBNAME="React Three Fiber" yarn dev
```

```sh
$ MDX=docs NEXT_PUBLIC_LIBNAME="React Three Fiber" yarn build
```

| var                     | description                                               | default |
| ----------------------- | --------------------------------------------------------- | ------- |
| `MDX`                   | Path to `*.mxd` folder<br>NB: can be relative or absolute | `docs`  |
| `NEXT_PUBLIC_LIBNAME`\* | Library name                                              | none    |

\* Required

# Docker

```sh
$ docker build -t pmndrs-docs .
```

```sh
$ export BASE_PATH=/foo; \
  export MDX=./docs; \
  export NEXT_PUBLIC_LIBNAME="pmndrs"; \
  \
  rm -rf "$MDX/out" && docker run --rm --init -it \
    -v "$MDX":/app/docs \
    -e BASE_PATH \
    -e DIST_DIR=docs/out \
    -e MDX \
    -e NEXT_PUBLIC_LIBNAME \
    pmndrs-docs yarn build
```
