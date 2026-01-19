---
"@pmndrs/docs": minor
---

Make package public and enable npm publishing

- Remove `"private": true` from package.json to allow publishing to npm
- Add NPM_TOKEN support to CI workflow for publishing
- Add id-token permission for npm provenance (trusted publisher)

This enables users to install and use the package via:
```bash
npx -y @pmndrs/docs build ./docs
```
