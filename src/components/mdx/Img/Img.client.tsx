'use client'

import cn from '@/lib/cn'
import { ComponentProps } from 'react'

/**
 * Client-side version of Img component for Storybook
 * This version doesn't perform server-side image size detection
 * but accepts the same props as the server component
 */
export function ImgClient({
  src,
  width,
  height,
  alt = '',
  className,
  ...props
}: ComponentProps<'img'>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      decoding="async"
      loading="lazy"
      alt={alt}
      className={cn('bg-surface-container inline-block rounded-lg', className)}
      width={width}
      height={height}
      {...props}
    />
  )
}
