'use client'

import cn from '@/lib/cn'
import { ComponentProps } from 'react'

/**
 * Client-side rendering component for images
 * Used by both the server component (after dimension detection)
 * and directly in Storybook stories
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
