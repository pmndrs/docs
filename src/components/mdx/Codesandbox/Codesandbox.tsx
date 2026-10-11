import { CodesandboxIcon } from '@/components/brand-icons'
import { Img } from '@/components/mdx/Img'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

/**
 * Sandbox data shared by article previews and documentation entry actions.
 */
export type CSB = {
  /** CodeSandbox identifier used in preview and embed destinations. */
  id: string
  /** Optional caption and accessible name of the preview link. */
  title?: string
  /**
   * Preview image: a path relative to the page (resolved like an `<img src>`), or a full URL.
   * Without one, a placeholder stands in: CodeSandbox no longer serves sandbox screenshots.
   */
  img?: string
  /** @deprecated Use `img` */
  screenshot_url?: string
  /** Optional explanatory text displayed with the preview. */
  description?: string
  /** Labels describing the sandbox's tools or subject. */
  tags?: string[]
}

type CodesandboxProps = CSB & {
  /** Show the interactive iframe instead of the linked preview. */
  embed?: boolean
} & ComponentProps<'a'>

/**
 * The public destination of a sandbox preview or documentation entry action.
 * @param id CodeSandbox identifier.
 */
export function sandboxUrl(id: string) {
  return `https://codesandbox.io/s/${id}`
}

function SandboxTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

/**
 * A linked sandbox Card with optional metadata, or the existing interactive iframe.
 */
export function Codesandbox({
  id,
  title,
  description,
  img,
  screenshot_url,
  tags = [],
  embed = false,
  className,
}: CodesandboxProps) {
  const src = img ?? screenshot_url

  if (embed) {
    return (
      <>
        <iframe
          src={`https://codesandbox.io/embed/${id}`}
          className="h-125 w-full"
          title={title}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
        {title && (
          <>
            <h6 className="mt-2 text-xs text-muted-foreground">{title}</h6>
            {description && <p className="mt-1">{description}</p>}
            {tags.length > 0 && <SandboxTags tags={tags} />}
          </>
        )}
      </>
    )
  }

  return (
    <div className="my-6">
      <Card className="pt-0">
        <a
          href={sandboxUrl(id)}
          target="_blank"
          rel="noreferrer"
          aria-label={title || `CodeSandbox ${id}`}
          className={cn('block', className)}
        >
          {src ? (
            <Img src={src} alt={title || ''} className="aspect-video w-full object-cover" />
          ) : (
            <span className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
              <CodesandboxIcon className="size-12" aria-hidden />
            </span>
          )}
        </a>
        {(title || description) && (
          <CardHeader>
            {title && (
              <CardTitle>
                <h6>{title}</h6>
              </CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        {tags.length > 0 && (
          <CardContent>
            <SandboxTags tags={tags} />
          </CardContent>
        )}
      </Card>
    </div>
  )
}
