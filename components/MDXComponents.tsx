import LazyLoad from 'react-lazyload'
import Codesandbox from './Codesandbox'
import clsx from 'clsx'
import Sandbox from './Sandbox'

const InlineCode = ({ children }) => (
  <code className="px-1 px-2 py-1 rounded font-mono text-sm text-gray-800 bg-gray-100">
    {children}
  </code>
)

const components = {
  StoryBookLink: ({ link }) => {
    return (
      <a
        href={`https://drei.vercel.app/?path=/story/${link}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://camo.githubusercontent.com/f0831c0be48497774dcc0781d24cccbc7eb95aeb4a6477be3cd9e208d7256a97/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d73746f7279626f6f6b2d253233666636396234"
          alt="storybook"
        ></img>
      </a>
    )
  },
  StoryBookEmbed: ({ id }) => (
    <LazyLoad height={400} once>
      <h3 className="text-xl mb-4 tracking-tight mt-6 heading">Example</h3>
      <iframe
        style={{
          width: '100%',
          height: 400,
        }}
        className="my-6"
        src={`https://drei.pmnd.rs/iframe.html?id=${id}&viewMode=story`}
      />
    </LazyLoad>
  ),
  Sandbox,
  Hint: ({ children }) => (
    <div className="shadow overflow-hidden bg-yellow-100 border-b border-gray-200 sm:rounded-lg px-6 py-4 leading-7 mb-6">
      {children}
    </div>
  ),
  Grid: ({ children }) => (
    <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 grid-list">
      {children}
    </ul>
  ),
  Callout: ({ children }) => children,
  Bleed: ({ children }) => children,
  Codesandbox,
  Heading: ({ children, id, level }) => {
    const Comp = level === 2 ? 'h2' : 'h3'
    return (
      <a
        href={`#${id}`}
        className={clsx(
          'heading',
          level === 2 ? 'text-3xl mb-6 mt-8' : 'text-xl mb-4 mt-6',
          'tracking-tight'
        )}
      >
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
        <a className="text-base" href={props.href} target="_blank" rel="noopener noreferrer">
          {props.children}
        </a>
      )
    }
    return (
      <a className="text-base" href={props.href}>
        {props.children}
      </a>
    )
  },
}

export default components
