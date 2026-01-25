import cn from '@/lib/cn'
import { ComponentProps } from 'react'

export const Iframe = ({
  src,
  width = '100%',
  height,
  title = 'Embedded content',
  className,
  aspectRatio = '16/9',
  loading = 'lazy',
  ...props
}: ComponentProps<'iframe'> & {
  aspectRatio?: string
}) => {
  const style = height
    ? undefined
    : {
        aspectRatio,
      }

  return (
    <div className={cn('my-8', className)}>
      <iframe
        src={src}
        width={width}
        height={height}
        title={title}
        loading={loading}
        className="bg-surface-container w-full rounded-lg border-0"
        style={style}
        {...props}
      />
    </div>
  )
}
