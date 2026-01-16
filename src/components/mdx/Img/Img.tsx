import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

import sizeOf from 'image-size'
import { resolve } from 'path'

export async function Img({
  src,
  width,
  height,
  alt = '',
  className,
  ...props
}: ComponentProps<'img'>) {
  const dims = {
    width,
    height,
  }

  //
  // If image is from MDX folder, we can determine its dimensions
  //

  if (
    process.env.MDX_BASEURL &&
    typeof src === 'string' &&
    src.startsWith(process.env.MDX_BASEURL)
  ) {
    const path = resolve(src.replace(process.env.MDX_BASEURL, process.env.MDX!))
    const { width: w, height: h } = sizeOf(path)
    const ratio = w && h ? w / h : undefined

    // If only one dimension is provided, calculate the other based on the image's aspect ratio
    dims.width ??= height && ratio ? Math.round(Number(height) * ratio) : w
    dims.height ??= width && ratio ? Math.round(Number(width) / ratio) : h
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
