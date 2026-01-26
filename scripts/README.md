# Build Scripts

## OG Image Generation

### `generate-og-images.mts`

Generates Open Graph images for all documentation pages at build time.

- Crawls MDX files and extracts metadata
- Generates 1200x630 PNG images using @vercel/og
- Saves to `public/og/{slug}.png`

### `copy-og-images.mts`

Ensures OG images are copied to the output directory after build.

- Runs after `next build` completes (or fails)
- Copies `public/og/` to `out/og/`
- Creates `out/` directory if needed
- Guarantees images are available for Playwright tests

## Font Management

### `copy-fonts.sh`

Copies font files to the public directory during setup.
