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
