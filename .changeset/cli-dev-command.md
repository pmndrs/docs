---
'@pmndrs/docs': minor
---

`pmndrs-docs dev [folder]`: the website `build --format website` exports, served live by `next dev` from a folder of MDX. The app is staged as for a build, the folder linked where the stylesheet's Tailwind `@source` scans, so every class a page uses exists in dev as in the build, and edits are rescanned. The folder's files are served on a free port, unless `--mdx-baseurl` says where they are. It takes every website option `build` takes, plus `--port`.

`dev.sh` is gone: `pnpm dev` runs the command on this repository's own `docs`, in place.
