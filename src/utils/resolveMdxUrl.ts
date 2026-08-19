import path from 'node:path'

export default function resolveMdxUrl(src: string, mdFile: string, baseUrl?: string) {
  // 1. Fully qualified URL or no baseUrl provided
  if (!baseUrl || src.includes('://')) {
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

  // 5. A base that is a path rather than a URL — what `dev` serves the MDX folder at — resolves
  // against the site itself, so there is nothing to make absolute
  if (baseUrl.startsWith('/')) return `${baseUrl}${resolvedPath}`

  // 6. Correctly append the path preserving the context of the baseUrl using WHATWG URL API
  return new URL(newUrlPath, baseUrl + '/').href
}
