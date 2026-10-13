import type { ReactNode } from 'react'

/**
 * Keeps folder fragments free of the website's navigation and document layout.
 */
export default function FragmentDocumentLayout({
  children,
}: {
  /** Compiled document content. */
  children: ReactNode
}) {
  return children
}
