import { useState, FC, useRef, useEffect } from 'react'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import { ErrorBoundary } from '../ErrorBoundary'
import { useObserver } from 'hooks/useObserver'
import { SandpackRunner, Sandpack } from '@codesandbox/sandpack-react'
import '@codesandbox/sandpack-react/dist/index.css'
import { CodeSandboxIcon } from 'components/Icons'

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
    import(`../../demos/${name}`).then((code) => {
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
      <div
        ref={containerRef}
        className="relative w-full grid"
        css={`
          height: 400px;
        `}
      >
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
      </div>
    ) : null
  }
  return (
    <div
      ref={containerRef}
      className="relative w-full grid"
      css={`
        height: 400px;
      `}
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          {title ? (
            <h3 className="uppercase text-sm tracking-large text-gray-700">{title}</h3>
          ) : null}
        </div>
        {description ? <span>{description}</span> : null}
        <a
          className="flex mt-3 items-center opacity-60 text-xs text-gray-700"
          target="_blank"
          rel="nofollow noopener noreferrer"
          href={`https://codesandbox.io/s/${url}`}
        >
          <CodeSandboxIcon className="mr-1" /> Try it on CodeSandbox
        </a>
      </div>

      <div className="relative h-full overflow-hidden">
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
      </div>
    </div>
  )
}
