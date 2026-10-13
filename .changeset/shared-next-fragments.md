---
'@pmndrs/docs': patch
---

Render HTML fragments through the same Next.js build and static export as the website.
Fragments retain their output without layout, stylesheets, or scripts, including when read
from stdin or a single file. These inputs now run a full Next.js build, with build logs sent
to stderr so stdout remains HTML only.
