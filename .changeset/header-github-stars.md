---
'@pmndrs/docs': minor
---

The header shows the official GitHub and Discord logos, and the GitHub link now carries the repo's
star count (`33k`), fetched once at build time from the `GITHUB` repo. It reuses
`CONTRIBUTORS_PAT` when set, and the link simply shows without a count if the GitHub API cannot be
reached.
