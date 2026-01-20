# Font Setup

This project uses self-hosted fonts from [@fontsource](https://fontsource.org/) for offline builds.

## Fonts Included

- **Inter** - Used for body text
- **Inconsolata** - Used for monospace/code text

## Setup

Font files are automatically copied from `node_modules/@fontsource/*` to `src/fonts/` during `pnpm install` via the `prepare` script.

### Manual Update

To manually update fonts, run:

```bash
pnpm run setup-fonts
```

## Why Self-Hosted?

- ✅ Builds work completely offline (no internet required)
- ✅ Better performance (no external font requests)
- ✅ Full control over font versions
- ✅ Visual appearance identical to Google Fonts

## Technical Details

- Font files are stored in `src/fonts/` (~872KB total)
- Next.js bundles fonts into static output using `next/font/local`
- Source packages: `@fontsource/inter` and `@fontsource/inconsolata`
- The `prepare` script runs after `pnpm install` and copies fonts automatically
