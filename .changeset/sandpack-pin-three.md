---
'@pmndrs/docs': patch
---

Sandpack previews that depend on `three` at `latest` (or any version from 0.186.0) work again: the
component now pins `three` to 0.185.1 for them. Since 0.186.0, three's CommonJS entry calls
`process.emitWarning`, which Sandpack's in-browser bundler does not provide, so those previews failed
with `process.emitWarning is not a function`.
