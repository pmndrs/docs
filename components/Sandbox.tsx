import { useEffect, useState } from 'react'

export default ({ id }) => {
  const [data, setData] = useState<{
    alias: string
    screenshot_url: string
    tags: string[]
    description: string
    title: string
  }>()

  useEffect(() => {
    fetch(`/api/get-sandbox?id=${id}`)
      .then((rsp) => rsp.json())
      .then(setData)
  }, [])

  if (!data) return null

  return (
    <div>
      <a href={`https://codesandbox.io/s/${data.alias}`} target="_blank">
        <img className="rounded shadow-lg" src={data.screenshot_url} alt={data.title} />{' '}
      </a>
      <h6 className="text-gray-700 font-bold capitalize mt-4">{data.title}</h6>
      <p className="text-gray-700">{data.description}</p>
      <div className="w-full">
        {data.tags.map((tag, i) => (
          <span
            className={`inline-block mt-1 text-gray-500 bg-gray-100 rounded px-1 py-1 text-xs ${
              i !== data.tags.length - 1 ? 'mr-1' : null
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
