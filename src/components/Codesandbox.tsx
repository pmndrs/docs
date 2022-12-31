import Image from 'next/image'
import { useCSB } from 'hooks/useCSB'
import clsx from 'clsx'

export interface CodesandboxProps {
  id: string
  tags?: string[]
  description?: string
  title?: string
  hideTitle?: boolean
}

export default function Codesandbox({
  id,
  tags: defaultTags,
  description: defaultDescription,
  title: defaultTitle,
  hideTitle = false,
}: CodesandboxProps) {
  const boxes = useCSB()
  const data = boxes[id]
  const tags = defaultTags || data?.tags || []
  const description = defaultDescription || data?.description || ''
  const title = defaultTitle || data?.title || ''

  return (
    <>
      <a href={`https://codesandbox.io/s/${id}`} target="_blank" rel="noreferrer">
        <Image
          className="rounded shadow-lg"
          src={data.screenshot_url}
          placeholder="empty"
          alt={data.title}
          width={1763}
          height={926}
          loading="lazy"
        />
      </a>
      {!hideTitle && (
        <>
          <h6 className="text-gray-700 font-bold mt-4">{title}</h6>
          <p className="text-gray-700 mt-1">{description}</p>
          <div className="w-full">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={clsx(
                  'inline-block mt-2 text-gray-500 bg-gray-100 rounded px-1 py-1 text-xs',
                  i !== tags.length - 1 && 'mr-1'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </>
  )
}
