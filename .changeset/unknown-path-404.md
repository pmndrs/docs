---
'@pmndrs/docs': patch
---

A path that is not a page of the docs (`/sitemap.xml`, `/.well-known/...`, a mistyped URL) is now a
404 on a server deployment, instead of a 500: the catch-all route only serves the pages built from
the MDX folder, and no longer tries to render anything else at runtime, where `MDX` may be unset.
The same goes for the markdown of a page that does not exist.
