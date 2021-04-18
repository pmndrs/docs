import fetch from 'node-fetch'

export default async function handler({ query: { id } }, res) {
  const data = await fetch(`https://codesandbox.io/api/v1/sandboxes/${id}`)
    .then((rsp) => rsp.json())
    .then((rsp) => rsp.data)

  res.status(200).json(data)
}
