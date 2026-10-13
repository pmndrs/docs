import type { ReactNode } from 'react'

/**
 * Supplies Next's required document shell around the extractable fragment.
 */
export default function FragmentLayout({
  children,
}: {
  /** Fragment route content. */
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
