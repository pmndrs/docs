import { parseDocsMetadata } from '@/utils/docs'

//
// Each page as raw markdown, at `/md/<path>.md` -- what the "Copy Page" and "View as Markdown"
// actions of a page header read, and what the "Open in ChatGPT/Claude" prompts point at.
//
// A route handler cannot sit next to `[...slug]/page.tsx`, hence its own `/md` prefix. It
// stays out of `/api`, which the static export leaves behind.
//

export const dynamic = 'force-static'

// Only the pages `generateStaticParams` lists exist; any other path is a 404, as for the pages
// themselves in `src/app/[...slug]/page.tsx`. Handled on demand instead, it threw a 500: `MDX` is
// only set at build time on Vercel.
export const dynamicParams = false

const SUFFIX = '.md'

type Params = { slug: string[] }

export async function generateStaticParams(): Promise<Params[]> {
  const MDX = process.env.MDX
  if (!MDX) {
    console.warn('MDX env var not set')
    return []
  }

  const docs = await parseDocsMetadata(MDX)

  // The suffix rides on the last segment, so the export writes `<path>.md` files
  return docs.map(({ slug }) => ({
    slug: [...slug.slice(0, -1), `${slug[slug.length - 1]}${SUFFIX}`],
  }))
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { MDX } = process.env
  if (!MDX) throw new Error('MDX env var not set')

  const { slug } = await params

  const path = slug.join('/')
  if (!path.endsWith(SUFFIX)) return new Response('Not Found', { status: 404 })
  const url = `/${path.slice(0, -SUFFIX.length)}`

  const docs = await parseDocsMetadata(MDX)
  const doc = docs.find((doc) => doc.url === url)
  if (!doc) return new Response('Not Found', { status: 404 })

  const markdown = `# ${doc.title}

${doc.description ? `${doc.description}\n\n` : ''}${doc.content.trim()}
`

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
