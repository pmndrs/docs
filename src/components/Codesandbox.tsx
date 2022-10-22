import Image from 'next/image'
import { useCSB } from 'hooks/useCSB'
import clsx from 'clsx'

export interface CodesandboxProps {
  id: string
}

export default function Codesandbox({ id }: CodesandboxProps) {
  const boxes = useCSB()
  const data = boxes.find((box) => box.id === id)!

  return (
    <>
      <a href={`https://codesandbox.io/s/${data.alias}`} target="_blank" rel="noreferrer">
        <Image
          className="rounded shadow-lg"
          src={`https://codesandbox.io/api/v1/sandboxes/${id}/screenshot.png`}
          placeholder="empty"
          alt={data.title}
          width={1763}
          height={926}
          loading="lazy"
        />
      </a>
      <h6 className="text-gray-700 font-bold mt-4">{data.title}</h6>
      <p className="text-gray-700 mt-1">{data.description}</p>
      <div className="w-full">
        {data.tags.map((tag, i) => (
          <span
            key={i}
            className={clsx(
              'inline-block mt-2 text-gray-500 bg-gray-100 rounded px-1 py-1 text-xs',
              i !== data.tags.length - 1 && 'mr-1'
            )}
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  )
}
