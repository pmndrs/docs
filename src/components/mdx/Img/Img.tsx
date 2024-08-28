import cn from '@/lib/cn'
import { ComponentProps } from 'react'

import sizeOf from 'image-size'
import { resolve } from 'path'

export async function Img({ src, alt = '', className, ...props }: ComponentProps<'img'>) {
  const dims: Partial<Pick<ComponentProps<'img'>, 'width' | 'height'>> = {
    width: undefined,
    height: undefined,
  }
  if (process.env.MDX_BASEURL && src?.startsWith(process.env.MDX_BASEURL)) {
    const path = resolve(src.replace(process.env.MDX_BASEURL, process.env.MDX!))
    const { width, height } = sizeOf(path)
    dims.width = width
    dims.height = height
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      decoding="async"
      loading="lazy"
      alt={alt}
      className={cn('bg-surface-container inline-block rounded-lg', className)}
      {...dims}
      {...props}
    />
  )
}
