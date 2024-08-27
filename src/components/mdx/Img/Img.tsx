import cn from '@/lib/cn'
import { ComponentProps } from 'react'

export function Img({ src, alt = '', className, ...props }: ComponentProps<'img'>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      decoding="async"
      loading="lazy"
      alt={alt}
      className={cn('bg-surface-container inline-block rounded-lg', className)}
      {...props}
    />
  )
}
