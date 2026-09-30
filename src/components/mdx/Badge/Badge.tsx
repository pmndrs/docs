import { Badge as UiBadge } from '@/components/ui/badge'
import type { ReactNode } from 'react'

/**
 * A tag under the page title, e.g. "storybook" or "suspense". Links to `href` when given.
 */
export function Badge({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) {
    return <UiBadge variant="secondary">{children}</UiBadge>
  }

  const isExternal = href.startsWith('https://')

  return (
    <UiBadge
      variant="secondary"
      render={
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        />
      }
    >
      {children}
    </UiBadge>
  )
}
