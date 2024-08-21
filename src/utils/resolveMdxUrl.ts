import path from 'node:path'
import url from 'node:url'

export default function resolveMdxUrl(src: string, mdFile: string, baseUrl?: string) {
  // console.log('')

  // console.log('image=', src)
  // console.log('file=', mdFile)

  // 1. Fully qualified URL or no baseUrl provided
  if (!baseUrl || src.includes('://')) {
    return src
  }

  // 2. Determine the directory path of the file
  const dirname = path.dirname(mdFile) // ""
  const directoryPath = mdFile.startsWith('/') ? dirname : '/' + dirname // "/getting-started/tutorials/store.mdx"
  // console.log('directoryPath=', directoryPath)

  // 3. Resolve the path to handle '.', '..', and './' correctly
  const resolvedPath = path.resolve(directoryPath, src)
  // console.log('resolvedPath=', resolvedPath)

  // 4. Construct the new URL using the resolved path
  // We remove the first character if it's a '/', to properly concatenate with the baseUrl
  const newUrlPath = resolvedPath.startsWith('/') ? resolvedPath.substr(1) : resolvedPath

  // 5. Correctly append the path preserving the context of the baseUrl
  return url.resolve(baseUrl + '/', newUrlPath)
}

//
// Tests/specs
//

// const baseUrl = 'http://localhost:8080/foo/bar'

// assert.equal(
//   resolveMdxUrl('dog.png', '/getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/tutorials/dog.png`
// )

// assert.equal(
//   resolveMdxUrl('./dog.png', '/getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/tutorials/dog.png`
// )

// assert.equal(
//   resolveMdxUrl('../dog.png', '/getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/dog.png`
// )

// assert.equal(
//   resolveMdxUrl('../../../../../../dog.png', '/getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/dog.png`
// )

// assert.equal(resolveMdxUrl('/dog.png', '/getting-started/tutorials/store.mdx', baseUrl), `${baseUrl}/dog.png`)
// assert.equal(
//   resolveMdxUrl('/my/beautiful/dog.png', '/getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/my/beautiful/dog.png`
// )

// assert.equal(
//   resolveMdxUrl('http://example.org/dog.png', '/getting-started/tutorials/store.mdx', baseUrl),
//   'http://example.org/dog.png'
// )

// assert.equal(
//   resolveMdxUrl('dog.png', 'getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/tutorials/dog.png`
// )

// assert.equal(
//   resolveMdxUrl('./dog.png', 'getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/tutorials/dog.png`
// )

// assert.equal(
//   resolveMdxUrl('../dog.png', 'getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/dog.png`
// )

// assert.equal(
//   resolveMdxUrl('../../../../../../dog.png', 'getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/dog.png`
// )

// assert.equal(resolveMdxUrl('/dog.png', 'getting-started/tutorials/store.mdx', baseUrl), `${baseUrl}/dog.png`)

// assert.equal(
//   resolveMdxUrl('http://example.org/dog.png', 'getting-started/tutorials/store.mdx', baseUrl),
//   'http://example.org/dog.png'
// )

// // edge cases

// assert.equal(
//   resolveMdxUrl('dog.png', '../getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/tutorials/dog.png`
// )

// assert.equal(
//   resolveMdxUrl('dog.png', '../getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/tutorials/dog.png`
// )
// assert.equal(
//   resolveMdxUrl('dog.png', '../../getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/tutorials/dog.png`
// )
// assert.equal(
//   resolveMdxUrl('../dog.png', '../../getting-started/tutorials/store.mdx', baseUrl),
//   `${baseUrl}/getting-started/dog.png`
// )
// assert.equal(
//   resolveMdxUrl(
//     '../../../../../../../dog.png',
//     '../../../../../../../getting-started/tutorials/store.mdx',
//     baseUrl
//   ),
//   `${baseUrl}/dog.png`
// )
