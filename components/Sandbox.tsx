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
        <img className="rounded shadow-sm" src={data.screenshot_url} alt={data.title} />
        <h6 className="text-gray-700 font-bold capitalize mt-4">{data.title}</h6>
        <p className="text-gray-700">{data.description}</p>
        {data.tags.map((tag, i) => (
          <span
            className={`text-gray-500 text-sm pt-2 ${i !== data.tags.length - 1 ? 'mr-1' : null}`}
          >
            {tag}
            {i !== data.tags.length - 1 ? ',' : ''}
          </span>
        ))}
      </a>
    </div>
  )
}
