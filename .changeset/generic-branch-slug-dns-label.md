---
'@pmndrs/docs': minor
---

`{branch}` (`{branch:generic}`) now fits its hostname label. A long branch made `<project>-git-<slug>-<scope>` longer than the 63 characters a DNS label holds, and Vercel refused the alias as "not a valid hostname" -- `claude/pages-shadcn-tailwind-prep-98d23c` gave a 64-character label in pmndrs/design-system. As `{branch:vercel}` already did, an overflowing slug is now cut and hashed: its first `63 - (rest of the label) - 7` characters, any trailing `-` dropped, then `-` and the first 6 hex characters of the branch name's SHA-256. Short branches, and `{branch}` outside a hostname, are unchanged.

So that an alias step need not reimplement that, `pmndrs-docs version-url` prints the URL the switcher links a branch to (`--hostname`: the hostname alone), and the reusable workflow outputs it, as `version_url` and `version_hostname`.
