import { Doc } from '@/app/[...slug]/DocsContext'

export default async function Post({ doc }: { doc: Doc }) {
  return <>{doc.content}</>
}
