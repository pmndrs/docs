---
'@pmndrs/docs': minor
---

`dev`: serve a folder of MDX, reloading as it is written

```sh
$ npx @pmndrs/docs@latest dev docs --libname "React Three Fiber" --icon 🥑
```

Pages are read on every request, and the folder is served alongside, so relative assets resolve
with no second server to start. Takes every website option `build` takes, plus `--port`.

Both commands now read a `.env` from the folder they run in — the variables the reusable
workflow sets, written down once; a flag, or a variable already in the environment, wins over
the file. `preview.sh` is replaced by `dev`. Needs node >=20.12.
