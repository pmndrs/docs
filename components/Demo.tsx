import { useState, FC, useRef, useEffect } from 'react'
import styled from 'styled-components'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import { ErrorBoundary } from './ErrorBoundary'
import { useObserver } from 'hooks/useObserver'
import { SandpackRunner, Sandpack } from '@codesandbox/sandpack-react'
import '@codesandbox/sandpack-react/dist/index.css'

interface DemoProps {
  title: string
  description?: string
  url?: string
  name?: string
  onlyView: boolean
}

export const Demo: FC<DemoProps> = ({ url, title, description, name, onlyView }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inViewport, setInViewport] = useState(false)

  const [data, setData] = useState<{}>()
  const [code, setCode] = useState('')

  useEffect(() => {
    if (url) {
      fetch(`/api/get-sandbox?id=${url}`)
        .then((rsp) => rsp.json())
        .then(({ modules, directories }) => {
          const files = modules.reduce((acc, curr) => {
            const dir = curr.directory_shortid
              ? '/' + directories.find((d) => d.shortid === curr.directory_shortid)?.title
              : ''
            acc[dir + '/' + curr.title] = curr.code
            return acc
          }, {})

          setData(files)
        })
    }
  }, [])

  useObserver(containerRef, (entry) => {
    setInViewport(entry.isIntersecting)
  })

  if (name) {
    import(`../demos/${name}`).then((code) => {
      const formatted = prettier.format(code.default, {
        parser: 'babel',
        plugins: [parserBabel],
      })

      setCode(formatted)
    })

    const opts = {
      dependencies: {
        '@react-spring/web': 'latest',
        'react-use-measure': 'latest',
        'react-spring': 'latest',
      },
      files: {
        '/styles.css': `body {
font-family: sans-serif;
text-align: center;
letter-spacing: -0.05em;
font-size: 3rem;
line-height: 1;
font-family: "Inter Var", "Inter", sans-serif;
font-weight: bold;
}
`,
        '/App.js': code,
      },
    }

    return code ? (
      <DemoContainer ref={containerRef}>
        {onlyView ? (
          <SandpackRunner
            template="react"
            customSetup={opts}
            options={{
              showNavigator: false,
            }}
          />
        ) : (
          <Sandpack
            template="react"
            customSetup={opts}
            options={{
              showTabs: false,
            }}
          />
        )}
      </DemoContainer>
    ) : null
  }
  return (
    <DemoContainer ref={containerRef}>
      <DemoHeader>
        <h3>{title}</h3>
        {description ? <span>{description}</span> : null}
        <DemoLink
          target="_blank"
          rel="nofollow noopener noreferrer"
          href={`https://codesandbox.io/s/github/pmndrs/react-spring/tree/master/demo/src/sandboxes/${title
            .split(' ')
            .join('-')
            .toLowerCase()}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
            <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>{' '}
          Try it on CodeSandbox
        </DemoLink>
      </DemoHeader>
      <DemoContent>
        <ErrorBoundary>
          {inViewport && data ? (
            <SandpackRunner
              customSetup={{
                files: data,
                entry: `/${JSON.parse(data['/package.json']).main}`,
                main: `/${JSON.parse(data['/package.json']).main}`,
              }}
              options={{
                showNavigator: false,
              }}
            />
          ) : null}
        </ErrorBoundary>
      </DemoContent>
    </DemoContainer>
  )
}

const DemoContainer = styled.section`
  position: relative;
  width: 100%;
  height: 400px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
`

const DemoHeader = styled.header`
  margin-bottom: 10px;

  & > h3 {
    margin: 0 0 0.17em 0 !important;
    text-transform: uppercase !important;
    color: #24292e !important;
    font-size: 13.6px !important;
    font-weight: 500 !important;
    line-height: 19.9px !important;
  }
`

const DemoLink = styled.a`
  color: #24292e !important;
  opacity: 0.6;
  display: flex;
  align-items: center;
  margin-top: 12px;
  font-size: 0.8em;

  & > svg {
    margin-right: 4px;
  }
`

const DemoContent = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;

  & > div {
    position: relative;
    height: 100%;
    overflow: hidden;
    border-radius: 7px;
    background: #f0f0f0;
  }
`
