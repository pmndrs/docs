---
'@pmndrs/docs': minor
---

The markdown of a page is now at the page's own URL plus `.md`, e.g.
`/getting-started/introduction.md`, instead of `/md/getting-started/introduction.md`. The "Copy Page"
and "View as Markdown" actions use the new URL. On a server deployment the old `/md/<path>.md` URLs
permanently redirect to the new ones; a static export writes the files at the new paths only, so
there the old URLs are a 404.
