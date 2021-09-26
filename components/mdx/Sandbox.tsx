import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

export default function Sandbox({ id }) {
  const sandboxRef = useRef()
  const [data, setData] = useState<{
    alias: string
    screenshot_url: string
    tags: string[]
    description: string
    title: string
  }>()

  useEffect(() => {
    // Wait to load section until in view
    const sectionObserver = new IntersectionObserver(([entry], observer) => {
      if (entry.isIntersecting) {
        // Once observed, don't observe again
        observer.unobserve(entry.target)

        // Fetch once observed
        fetch(`/api/get-sandbox?id=${id}`)
          .then((rsp) => rsp.json())
          .then(setData)
      }
    })

    sectionObserver.observe(sandboxRef.current)

    return () => {
      sectionObserver.disconnect()
    }
  }, [id])

  return (
    <div ref={sandboxRef}>
      {/* Render skeleton while loading */}
      {!data && (
        <>
          <div aria-hidden className="loading rounded" style={{ height: 128 }} />
          <h6 aria-hidden className="loading rounded text-gray-700 font-bold mt-4">
            loading
          </h6>
          <p aria-hidden className="loading rounded text-gray-700 mt-1">
            loading
          </p>
          <div className="w-full">
            <span
              aria-hidden
              className="loading inline-block mt-2 text-gray-500 bg-gray-100 rounded px-1 py-1 text-xs mr-1"
            >
              loading
            </span>
          </div>
        </>
      )}
      {data && (
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
                className={`inline-block mt-2 text-gray-500 bg-gray-100 rounded px-1 py-1 text-xs ${
                  i !== data.tags.length - 1 ? 'mr-1' : ''
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
