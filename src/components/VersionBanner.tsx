'use client'

import { GitBranchIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { versionInfo, withoutTrailingSlash } from '@/utils/version'

/**
 * Over the article, on any deployment other than production's, when the version switcher is on
 * (`VERSION_URL_TEMPLATE`): says which branch this is, and links to the same page on production.
 */
export function VersionBanner({ className }: { className?: string }) {
  // Without its base path: the production URL already includes it.
  const pathname = usePathname()

  const { branch, urlTemplate, productionBranch, productionUrl } = versionInfo
  if (!urlTemplate || !branch || branch === productionBranch) return null

  const productionHref = productionUrl
    ? `${withoutTrailingSlash(productionUrl)}${pathname}`
    : undefined

  return (
    // Wrapped: `.post-container > *` (globals.css) forces `display: block` on the article's
    // children, which would undo the Alert's grid and push its icon onto a row of its own.
    <div className={className}>
      {/* A polite `status`, not the `alert` default: it is there from the page load, not news to
          interrupt the reader with. */}
      <Alert role="status">
        <GitBranchIcon />
        <AlertTitle>
          You&apos;re viewing the <code>{branch}</code> deployment.
        </AlertTitle>
        {productionHref && (
          <AlertDescription>
            <a href={productionHref}>
              View on <code>{productionBranch}</code> →
            </a>
          </AlertDescription>
        )}
      </Alert>
    </div>
  )
}
