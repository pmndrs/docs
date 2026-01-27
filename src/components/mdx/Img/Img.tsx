import { ComponentProps } from 'react'

import sizeOf from 'image-size'
import { resolve } from 'path'

import { ImgClient } from './Img.client'

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

  return <ImgClient src={src} alt={alt} className={className} {...dims} {...props} />
}
