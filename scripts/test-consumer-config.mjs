// Exercises the bundled CLI, Next's server/client boundary, and the exported preview.
// Run separately from the unit suite: node scripts/test-consumer-config.mjs
import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { cp, mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scratch = await mkdtemp(join(tmpdir(), 'pmndrs-docs-consumer-'))
const cli = join(root, 'bin/pmndrs-docs.mjs')
const environment = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
// Do not inherit the developer's documentation corpus or deployment configuration.
for (const name of Object.keys(environment)) {
  if (
    /^(MDX|DOCS_CONFIG|BASE_PATH|DIST_DIR|OUTPUT|HOME_REDIRECT|ICON|LOGO|GITHUB|DISCORD)$/.test(
      name,
    ) ||
    /^(NEXT_PUBLIC_|VERSION_|THEME_|SOURCECODE_BASEURL|EDIT_BASEURL|MDX_BASEURL)/.test(name)
  ) {
    delete environment[name]
  }
}

async function run(args, { cwd = root, env = {}, input, capture = false } = {}) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...environment, ...env },
    stdio: ['pipe', capture ? 'pipe' : 'inherit', 'inherit'],
  })
  let output = ''
  child.stdout?.on('data', (chunk) => (output += chunk.toString()))
  child.stdin.end(input)
  const [code] = await once(child, 'close')
  assert.equal(code, 0, `Command failed: node ${args.join(' ')}`)
  return output
}

function assertExtensions(html) {
  assert.match(html, /data-testid="consumer-foundations"/)
  assert.match(html, /data-token="compact" data-value="4"/)
  assert.match(html, /data-token="comfortable" data-value="12"/)
  assert.match(html, /data-testid="consumer-counter" data-count="7"/)
}

async function serve(directory) {
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
  }
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const filename = join(directory, pathname === '/' ? '/index.html' : pathname)
    try {
      const path = extname(filename) ? filename : `${filename}.html`
      response.setHeader('Content-Type', contentTypes[extname(path)] ?? 'application/octet-stream')
      response.end(await readFile(path))
    } catch {
      response.writeHead(404).end()
    }
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  return { server, url: `http://127.0.0.1:${server.address().port}` }
}

let browser
let server
try {
  const configured = join(scratch, 'configured')
  const plain = join(scratch, 'plain')
  await cp(join(root, 'tests/consumer-config'), scratch, { recursive: true })
  // Use a separate React installation: a symlink to the engine would hide duplicate-React bugs.
  await mkdir(join(configured, 'node_modules'), { recursive: true })
  await cp(
    await realpath(join(root, 'node_modules/react')),
    join(configured, 'node_modules/react'),
    { recursive: true },
  )
  const mdxFile = join(configured, 'docs/introduction.mdx')
  const original = await readFile(mdxFile)
  await run(['scripts/build-cli.mjs'])

  // The same unchanged source travels through all fragment entry points.
  assertExtensions(
    await run([cli, 'build', 'docs/introduction.mdx'], { cwd: configured, capture: true }),
  )
  assertExtensions(
    await run([cli, 'build', mdxFile, '--config', join(configured, 'docs.config.ts')], {
      cwd: plain,
      capture: true,
    }),
  )
  assertExtensions(
    await run([cli, 'build'], {
      cwd: plain,
      env: { DOCS_CONFIG: join(configured, 'docs.config.ts') },
      input: original,
      capture: true,
    }),
  )
  await run([cli, 'build', 'docs', 'fragments'], { cwd: configured })
  assertExtensions(await readFile(join(configured, 'fragments/introduction.html'), 'utf8'))
  const plainFragment = await run([cli, 'build', 'docs/introduction.mdx'], {
    cwd: plain,
    capture: true,
  })
  assert.match(plainFragment, /data-testid="plain-document"/)

  console.log('Building the configured consumer website…')
  await run(
    [
      cli,
      'build',
      'docs',
      'website',
      '--format',
      'website',
      '--libname',
      'Consumer',
      '--url',
      'http://localhost',
    ],
    { cwd: configured },
  )
  const website = join(configured, 'website')
  assertExtensions(await readFile(join(website, 'introduction.html'), 'utf8'))
  assert.deepEqual(await readFile(mdxFile), original, 'The consumer MDX source was rewritten')

  const preview = await serve(website)
  server = preview.server
  browser = await chromium.launchPersistentContext(join(scratch, 'chrome-profile'), {
    executablePath: process.env.CHROME_FOR_TESTING_PATH ?? chromium.executablePath(),
    headless: true,
    args: ['--use-mock-keychain', '--password-store=basic'],
  })
  const page = await browser.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto(`${preview.url}/introduction`, { waitUntil: 'networkidle' })
  await expect(page.getByTestId('consumer-foundations').locator('tr')).toHaveCount(2)
  const counter = page.getByTestId('consumer-counter')
  await expect(counter).toHaveAttribute('data-count', '7')
  await counter.click()
  await expect(counter).toHaveAttribute('data-count', '8')
  assert.deepEqual(pageErrors, [], 'The exported preview raised client errors')
  await browser.close()
  browser = undefined
  await new Promise((resolve) => server.close(resolve))
  server = undefined

  console.log('Building a consumer without configuration…')
  await run(
    [
      cli,
      'build',
      'docs',
      'website',
      '--format',
      'website',
      '--libname',
      'Consumer',
      '--url',
      'http://localhost',
    ],
    { cwd: plain },
  )
  assert.match(
    await readFile(join(plain, 'website/introduction.html'), 'utf8'),
    /data-testid="plain-document"/,
  )
  assert.deepEqual(await readFile(mdxFile), original, 'The consumer MDX source was rewritten')
  console.log('Consumer fragments, websites, immutable MDX, and client hydration passed.')
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.close(resolve))
  await rm(scratch, { recursive: true, force: true })
}
