```sh
$ MDX=~/code/pmndrs/react-three-fiber/docs \
  NEXT_PUBLIC_LIBNAME="React Three Fiber" \
  BASE_PATH= \
  DIST_DIR= \
    npm run dev
```

http://localhost:3000/getting-started/introduction

```sh
$ rm -rf out; \
  MDX=~/code/pmndrs/react-three-fiber/docs \
  NEXT_PUBLIC_LIBNAME="React Three Fiber" \
  BASE_PATH= \
  DIST_DIR= \
  OUTPUT=export \
    npm run build && \
  npx serve out
```

http://localhost:3000/getting-started/introduction

| var                     | description                                               | default |
| ----------------------- | --------------------------------------------------------- | ------- |
| `MDX`\*                 | Path to `*.mdx` folder<br>NB: can be relative or absolute | none    |
| `NEXT_PUBLIC_LIBNAME`\* | Library name                                              | none    |
| `BASE_PATH`             | base path for the final URL                               | none    |
| `DIST_DIR`              | Path to the output folder                                 | `out`   |
| `OUTPUT`                | Set to `export` for static `out`put                       | none    |

\* Required

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
  \
  rm -rf "$MDX/out"; \
  docker run --rm --init -it \
    -v "$MDX":/app/docs \
    -e BASE_PATH \
    -e DIST_DIR="$MDX/out$BASE_PATH" \
    -e MDX \
    -e NEXT_PUBLIC_LIBNAME \
    -e OUTPUT \
    pmndrs-docs npm run build && \
  npx -y serve "$MDX/out"
```

Then go to http://localhost:3000/react-three-fiber/getting-started/introduction
