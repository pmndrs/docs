import Codesandbox from './Codesandbox'
import StoryBook from './Storybook'
import clsx from 'clsx'
import Sandbox from './Sandbox'
import { TweetGrid } from './TweetGrid'
import { YouTubeEmbed } from './YoutubeEmbed'
import { GridUsedBy } from './GridUsedBy'
import { Demo } from './Demo'
import { DemoGrid } from './DemoGrid'

const InlineCode = ({ children }) => {
  return (
    <code className="px-2 py-1 rounded font-mono text-sm text-gray-800 bg-gray-100">
      {children}
    </code>
  )
}

const components = {
  StoryBook,
  Demo,
  DemoGrid,
  YouTubeEmbed,
  GridUsedBy,
  Sandbox,
  TweetGrid,
  Hint: ({ children }) => (
    <div className="shadow overflow-hidden bg-yellow-100 border-b border-gray-200 sm:rounded-lg px-6 py-4 mb-6">
      {children}
    </div>
  ),
  Grid: ({ children, cols = 4 }) => (
    <ul
      className={`grid sm:grid-cols-2 ${
        cols === 4
          ? 'md:grid-cols-4'
          : cols === 3
          ? 'md:grid-cols-3'
          : cols === 2
          ? 'md:grid-cols-2'
          : 'md:grid-cols-1'
      } gap-4 text-sm text-gray-700 grid-list`}
      style={{ marginBottom: '1rem' }}
    >
      {children}
    </ul>
  ),
  Callout: ({ children }) => children,
  Bleed: ({ children }) => children,
  Codesandbox,
  Heading: ({ children, id, level, ...rest }) => {
    const headingStyle = {
      2: 'text-3xl mb-6 mt-8',
      3: 'text-xl mb-4 mt-6',
      4: 'text-base mb-4 mt-4',
    }

    const clampedLevel = Math.min(Math.max(level, 2), 4)
    const Comp = `h${clampedLevel}`
    return (
      <a
        href={`#${id}`}
        className={clsx('heading', headingStyle[clampedLevel], 'tracking-tight')}
        {...rest}
      >
        {/* @ts-ignore */}
        <Comp id={id}>{children}</Comp>
      </a>
    )
  },
  ul: ({ children }) => <ul className="px-4 mb-8">{children}</ul>,
  ol: ({ children }) => <ol className="px-4 mb-8">{children}</ol>,
  li: ({ children }) => <li className="mb-4 text-base leading-6 text-gray-700">{children}</li>,
  inlineCode: InlineCode,
  InlineCode,
  p: ({ children }) => <p className="mb-4 text-base text-gray-700">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="mb-8 text-base pl-4 border-l-4 border-gray-600">{children}</blockquote>
  ),
  table: ({ children }) => {
    return (
      <div className="flex flex-col my-6">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-6 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow-lg overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="divide-y divide-gray-200 w-full"> {children}</table>
            </div>
          </div>
        </div>
      </div>
    )
  },
  a: (props) => {
    if (props.href.startsWith('https://')) {
      return (
        <a href={props.href} target="_blank" rel="noopener noreferrer">
          {props.children}
        </a>
      )
    }
    return <a href={props.href}>{props.children}</a>
  },
}

export default components
