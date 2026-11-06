import path from 'node:path'

/**
 * Whether `MDX_BASEURL` is a path only, root-relative, e.g. `/react-three-fiber` or `/`, rather
 * than an absolute URL. A protocol-relative `//host` is not a path.
 */
export function isPathBaseUrl(baseUrl: string) {
  return baseUrl.startsWith('/') && !baseUrl.startsWith('//')
}

/**
 * A path-only base without its trailing slashes: `/react-three-fiber/` gives
 * `/react-three-fiber`, `/` gives `''`.
 */
function trimPathBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '')
}

// Any origin: a path-only base is resolved against it, and only the path is kept
const PLACEHOLDER_ORIGIN = 'http://placeholder.invalid'

/**
 * Resolves a `src` written in an MDX file, relative to that file, under `baseUrl`, the URL the
 * MDX folder is served at.
 *
 * - an absolute `baseUrl` (e.g. `http://localhost:60141`) gives an absolute URL
 * - a path-only `baseUrl` (e.g. `/react-three-fiber`, or `/`) gives a root-relative URL
 * - no `baseUrl`, or a `src` with a scheme or protocol-relative, gives `src` as is
 *
 * @example resolveMdxUrl('dog.png', 'advanced/introduction.mdx', '/integral') // "/integral/advanced/dog.png"
 */
export default function resolveMdxUrl(src: string, mdFile: string, baseUrl?: string) {
  // 1. Absolute URL (with a scheme, like `https:` or `data:`, or `//host/...`) or no baseUrl provided
  if (!baseUrl || /^([a-z][a-z\d+.-]*:|\/\/)/i.test(src)) {
    return src
  }

  // 2. Determine the directory path of the file
  const dirname = path.dirname(mdFile)
  const directoryPath = mdFile.startsWith('/') ? dirname : '/' + dirname

  // 3. Resolve the path to handle '.', '..', and './' correctly
  const resolvedPath = path.resolve(directoryPath, src)

  // 4. Construct the new URL using the resolved path
  // We remove the first character if it's a '/', to properly concatenate with the baseUrl
  const newUrlPath = resolvedPath.startsWith('/') ? resolvedPath.substring(1) : resolvedPath

  // 5. A path-only base: resolved the same way, under a placeholder origin dropped afterwards
  if (isPathBaseUrl(baseUrl)) {
    const url = new URL(newUrlPath, `${PLACEHOLDER_ORIGIN}${trimPathBaseUrl(baseUrl)}/`)
    return `${url.pathname}${url.search}${url.hash}`
  }

  // 6. Correctly append the path preserving the context of the baseUrl using WHATWG URL API
  return new URL(newUrlPath, baseUrl + '/').href
}

/**
 * The file in the MDX folder that `src` points to: the reverse of `resolveMdxUrl`, for a `src`
 * under `baseUrl`. `undefined` for any other `src`, which is not in the MDX folder.
 *
 * With an absolute `baseUrl`, the `baseUrl` prefix of `src` is swapped for `mdxFolder`, as is.
 * With a path-only one, the query and hash are dropped and the path is decoded.
 *
 * @example mdxFilePath('/integral/advanced/dog.png', '/integral', '/home/me/docs') // "/home/me/docs/advanced/dog.png"
 */
export function mdxFilePath(src: string, baseUrl: string | undefined, mdxFolder: string) {
  if (!baseUrl) return undefined

  if (!isPathBaseUrl(baseUrl)) {
    if (!src.startsWith(baseUrl)) return undefined
    return path.resolve(src.replace(baseUrl, mdxFolder))
  }

  // A root-relative `src`, under the base path
  if (!mdxFolder) return undefined
  const prefix = `${trimPathBaseUrl(baseUrl)}/`
  if (src.startsWith('//') || !src.startsWith(prefix)) return undefined

  const { pathname } = new URL(src, PLACEHOLDER_ORIGIN)
  return path.resolve(mdxFolder, decodeURIComponent(pathname.slice(prefix.length)))
}

/**
 * The URL of a page's social image (`og:image`), from its `image`.
 *
 * With a path-only `baseUrl` (`MDX_BASEURL`), the image is root-relative, its base path
 * included; but Next joins a relative image URL to the path of `metadataBase`, which already
 * holds that base path. So it is made absolute against the origin of `siteUrl`
 * (`NEXT_PUBLIC_URL`), when there is one; without one, Next resolves it against the deployment's
 * origin.
 *
 * Any other image is returned as is.
 */
export function socialImageUrl(
  image: string,
  baseUrl: string | undefined,
  siteUrl: string | undefined,
) {
  if (!baseUrl || !isPathBaseUrl(baseUrl) || !siteUrl) return image
  if (!image.startsWith('/') || image.startsWith('//')) return image

  return new URL(image, siteUrl).href
}
