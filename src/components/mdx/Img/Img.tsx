import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

import { imageSizeFromFile } from 'image-size/fromFile'
import { mdxFilePath } from '@/utils/resolveMdxUrl'

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

  const path =
    typeof src === 'string'
      ? mdxFilePath(src, process.env.MDX_BASEURL, process.env.MDX!)
      : undefined
  if (path) {
    const { width: w, height: h } = await imageSizeFromFile(path)
    const ratio = w && h ? w / h : undefined

    // If only one dimension is provided, calculate the other based on the image's aspect ratio
    dims.width ??= height && ratio ? Math.round(Number(height) * ratio) : w
    dims.height ??= width && ratio ? Math.round(Number(width) / ratio) : h
  }

  return (
    <img
      src={src}
      decoding="async"
      loading="lazy"
      alt={alt}
      className={cn('bg-surface-container inline-block rounded-2xl', className)}
      {...dims}
      {...props}
    />
  )
}
