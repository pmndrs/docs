import { svg } from '@/utils/icon'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

//
// The site's icon, published at `/icon.svg` -- what the `<link rel="icon">` of every page points
// at (`src/app/layout.tsx`), and what the libraries menu of every other pmndrs docs site shows
// next to this library's name.
//
// Built from `ICON`:
// - an emoji: the same SVG as ever, from `svg()`
// - a path, local to `MDX` (e.g. `/favicon.ico`): an SVG embedding that image as a data URI. Not a
//   link to it: an SVG shown by an `<img>` cannot load anything external.
//

export const dynamic = 'force-static'

// The image types an `ICON` path can have, by extension
const IMAGE_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

/**
 * An SVG showing the image at `path` (local to the `mdx` folder), embedded as a data URI.
 *
 * Throws if the image is missing or of an unknown type: `ICON` is then misconfigured, and the
 * build should say so rather than publish a broken icon.
 */
async function imageSvg(path: string, mdx: string) {
  const type = IMAGE_TYPES[extname(path).toLowerCase()]
  if (!type) {
    throw new Error(
      `ICON "${path}": unsupported image type, expected one of ${Object.keys(IMAGE_TYPES).join(', ')}`,
    )
  }

  const image = await readFile(join(mdx, path))
  const href = `data:${type};base64,${image.toString('base64')}`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><image href="${href}" width="100" height="100"/></svg>
`
}

export async function GET() {
  const { ICON, MDX } = process.env

  // No icon configured: nothing to publish. A static export writes this body all the same, so
  // `next-build.sh` and the CLI's `src/cli/website.ts` remove the file.
  if (!ICON) return new Response('Not Found', { status: 404 })

  let body: string
  if (ICON.startsWith('/')) {
    if (!MDX) throw new Error('MDX env var not set')
    body = await imageSvg(ICON, MDX)
  } else {
    body = svg(ICON)
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  })
}
