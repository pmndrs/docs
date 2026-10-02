---
'@pmndrs/docs': minor
---

Each site now publishes its icon at `/icon.svg`, built from `ICON`: an emoji is drawn as before,
and an image path (local to `MDX`) is embedded as a data URI, so the file stands on its own. The
favicon of every page points at it. An `ICON` path that is missing, or not an image, now fails the
build instead of linking to a broken favicon.

The header's libraries menu, and the cards of the docs hub, show each library's own `/icon.svg`
when it has no bundled icon, and a generic package icon until that site is rebuilt.
