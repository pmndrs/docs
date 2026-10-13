import { packageManagers, type PackageManagerCommands } from '@/utils/packageManagers'
import resolveMdxUrl from '@/utils/resolveMdxUrl'
import type { MtbConfig } from 'material-theme-builder'
import { isValidElement, type ComponentProps, type ReactNode } from 'react'

type ChildrenProps = { children?: ReactNode }

function Content({ children }: ChildrenProps) {
  return <div>{children}</div>
}

function Code({
  children,
  className,
  title,
  ...commands
}: ComponentProps<'pre'> & Partial<PackageManagerCommands>) {
  const suppliedCommands = packageManagers.filter((manager) => commands[manager] !== undefined)
  if (suppliedCommands.length) {
    return (
      <div>
        {suppliedCommands.map((manager) => (
          <div key={manager}>
            <p>
              <strong>{manager}</strong>
            </p>
            <pre>
              <code className="language-sh">{commands[manager]}</code>
            </pre>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {title && (
        <p>
          <strong>{title}</strong>
        </p>
      )}
      <pre>
        {isValidElement(children) && children.type === 'code' ? (
          children
        ) : (
          <code className={className}>{children}</code>
        )}
      </pre>
    </div>
  )
}

function Gha({
  children,
  keyword = 'NOTE',
  title,
}: ChildrenProps & { keyword?: string; title?: string }) {
  const kind = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'].includes(keyword)
    ? keyword
    : 'NOTE'
  return (
    <blockquote>
      <p>
        {`[!${kind}]`}
        {title && (
          <>
            {' '}
            <strong>{title}</strong>
          </>
        )}
      </p>
      {children}
    </blockquote>
  )
}

function ThemeSeeds({
  presets = [],
}: {
  presets?: { name: string; label?: string; config: MtbConfig }[]
}) {
  const options = [
    'source',
    'colorMatch',
    'scheme',
    'primary',
    'secondary',
    'tertiary',
    'neutral',
    'neutralVariant',
    'error',
  ] as const satisfies readonly (keyof MtbConfig)[]

  return (
    <table>
      <thead>
        <tr>
          <th>Preset</th>
          <th>Option</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {presets.flatMap(({ name, label, config }) =>
          options.map((option) => {
            const value = config[option]
            if (value === undefined || (option === 'scheme' && config.colorMatch)) return null
            return (
              <tr key={`${name}/${option}`}>
                <td>{label ?? name}</td>
                <td>
                  <code>{option}</code>
                </td>
                <td>
                  <code>{String(value)}</code>
                </td>
              </tr>
            )
          }),
        )}
      </tbody>
    </table>
  )
}

/**
 * Static article representations of the built-in MDX components, without site controls.
 * Interactive components expose their authored content or a destination, not browser state.
 */
export function markdownComponents({
  entries,
  relFilePath,
  baseUrl,
}: {
  /** Documentation destinations available to the Entries component. */
  entries: { url: string; title: string; slug: string[] }[]
  /** Source-relative path used to resolve image references. */
  relFilePath: string
  /** Optional public root of the documentation assets. */
  baseUrl?: string
}) {
  function Img({ src, alt = '', title }: ComponentProps<'img'>) {
    return (
      <img
        src={typeof src === 'string' ? resolveMdxUrl(src, relFilePath, baseUrl) : undefined}
        alt={alt}
        title={title}
      />
    )
  }

  return {
    Badge: ({ href, label, children }: ChildrenProps & { href?: string; label?: string }) => {
      const content = (
        <>
          {label && <>{label} </>}
          {children}
        </>
      )
      return href ? <a href={href}>{content}</a> : <span>{content}</span>
    },
    Code,
    Color: ({ role, color, children }: ChildrenProps & { role?: string; color?: string }) => (
      <span>
        <code>{color ?? role}</code>
        {children}{' '}
      </span>
    ),
    ColorGroup: Content,
    Details: Content,
    Entries: ({ excludedGroups = [] }: { excludedGroups?: string[] }) => (
      <ul>
        {entries
          .filter(({ slug }) => !excludedGroups.includes(slug[0]))
          .map(({ url, title }) => (
            <li key={url}>
              <a href={`${process.env.BASE_PATH ?? ''}${url}`}>{title}</a>
            </li>
          ))}
      </ul>
    ),
    Gha,
    Grid: Content,
    Hint: Gha,
    Img,
    img: Img,
    Intro: Content,
    Keypoints: ({ title = 'Keypoints', children }: ChildrenProps & { title?: string }) => (
      <section>
        <h2>{title}</h2>
        <ul>{children}</ul>
      </section>
    ),
    KeypointsItem: ({ children }: ChildrenProps) => <li>{children}</li>,
    Contributors: ({ owner, repo }: { owner: string; repo: string }) => (
      <p>
        <a href={`https://github.com/${owner}/${repo}/graphs/contributors`}>Contributors</a>
      </p>
    ),
    Backers: ({ repo }: { repo: string }) => (
      <p>
        <a href={`https://opencollective.com/${repo}#backers`}>Backers</a>
      </p>
    ),
    McpLiveEmbed: () => (
      <p>
        <a href="https://docs.pmnd.rs/mcp/live">MCP server requests, live</a>
      </p>
    ),
    Mermaid: ({ chart, children }: ChildrenProps & { chart?: string }) => (
      <pre>
        <code className="language-mermaid">{chart ?? children}</code>
      </pre>
    ),
    Sandpack: ({ children }: ChildrenProps) => (
      <div>
        <p>Interactive code example (available on the documentation website).</p>
        {children}
      </div>
    ),
    Step: ({ children }: ChildrenProps) => <h3>{children}</h3>,
    Steps: Content,
    Summary: ({ children }: ChildrenProps) => (
      <p>
        <strong>{children}</strong>
      </p>
    ),
    ThemeSeeds,
    Tabs: Content,
    TabsList: Content,
    TabsTrigger: ({ children }: ChildrenProps) => (
      <p>
        <strong>{children}</strong>
      </p>
    ),
    TabsContent: Content,
    Codesandbox: ({
      id,
      title,
      description,
      children,
    }: ChildrenProps & {
      id: string
      title?: string
      description?: string
    }) => (
      <div>
        <p>
          <a href={`https://codesandbox.io/s/${id}`}>{title ?? `CodeSandbox ${id}`}</a>
        </p>
        {description && <p>{description}</p>}
        {children}
      </div>
    ),
  }
}
