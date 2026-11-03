---
'@pmndrs/docs': patch
---

Only `.md` and `.mdx` files are compiled as pages: an MDX folder (or subfolder) whose name contains `.md` no longer compiles every asset in it as MDX, and its pages keep the folder name in their slug.
