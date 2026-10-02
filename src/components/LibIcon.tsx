'use client'

import cn from '@/lib/cn'
import { libs, type Library } from '@/libs'
import { libsIcons } from '@/libs-icons'
import { PackageIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

/**
 * The icon of a pmndrs library, decorative, `size` pixels square:
 * 1. its asset in `libsIcons`, if it has one
 * 2. else, for a docs site built with pmndrs/docs, the icon it publishes at `<docs_url>/icon.svg`
 *    (`src/app/icon.svg/route.ts`)
 * 3. else, or if that one fails to load (a site not rebuilt since, or without `ICON`), a generic
 *    package icon -- in the same box, so nothing moves.
 */
export function LibIcon({
  id,
  size,
  className,
}: {
  id: keyof typeof libs
  size: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  const asset = libsIcons[id]
  if (asset) {
    return (
      <Image
        src={asset}
        width={size}
        height={size}
        alt=""
        aria-hidden
        className={cn('object-contain', className)}
      />
    )
  }

  // Every such `docs_url` is absolute but the docs hub's own, and the hub has an asset above
  const lib: Library = libs[id]
  if (lib.pmndrs_docs && !failed) {
    return (
      <Image
        src={`${lib.docs_url}/icon.svg`}
        width={size}
        height={size}
        alt=""
        aria-hidden
        className={cn('object-contain', className)}
        onError={() => setFailed(true)}
      />
    )
  }

  // A stroke of the same 1.5px at any size: scaled with the icon, it turns heavy in a large box
  return (
    <PackageIcon
      size={size}
      strokeWidth={1.5}
      absoluteStrokeWidth
      aria-hidden
      className={cn('text-muted-foreground', className)}
    />
  )
}
