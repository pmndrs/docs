export default function Index() {
  return null
}

async function getInitialProps({ res }) {
  const targetURL = '/react-spring/introduction'
  res.writeHead(307, { Location: targetURL })
  res.end()
  return {}
}

Index.getInitialProps = getInitialProps
