import type { Meta, StoryObj } from '@storybook/react'
import { Layout, LayoutContent, LayoutHeader, LayoutNav, LayoutAside } from '@/components/Layout'
import { Nav } from '@/components/Nav'
import Search from '@/components/Search'
import Link from 'next/link'
import { VscGithubAlt } from 'react-icons/vsc'
import { PiDiscordLogoLight } from 'react-icons/pi'
import cn from '@/lib/cn'

// Mock documentation page component
function MockDocumentationPage() {
  // Mock data for navigation
  const mockDocs = [
    {
      title: 'Getting Started',
      url: '/getting-started/introduction',
      slug: ['getting-started', 'introduction'],
      order: 0,
      category: 'Getting Started',
    },
    {
      title: 'Installation',
      url: '/getting-started/installation',
      slug: ['getting-started', 'installation'],
      order: 1,
      category: 'Getting Started',
    },
    {
      title: 'API Reference',
      url: '/api/canvas',
      slug: ['api', 'canvas'],
      order: 2,
      category: 'API',
    },
  ]

  const asPath = 'getting-started/introduction'

  const header = (
    <div className="flex h-(--header-height) items-center gap-(--rgrid-m) px-(--rgrid-m)">
      <div className="flex items-center">
        <Link href="/" aria-label="Docs">
          <span className="font-bold">pmndrs</span>
        </Link>
        <span className="font-normal">
          .<a href="https://pmnd.rs">docs</a>
        </span>
      </div>

      <Search className="grow" />

      <div className="flex">
        <Link
          href="https://github.com/pmndrs/docs"
          className={cn('hidden size-9 items-center justify-center lg:flex')}
          target="_blank"
        >
          <VscGithubAlt />
        </Link>
        <Link
          href="https://discord.gg/poimandres"
          className={cn('hidden size-9 items-center justify-center lg:flex')}
          target="_blank"
        >
          <PiDiscordLogoLight />
        </Link>
      </div>
    </div>
  )

  return (
    <Layout>
      <LayoutHeader>{header}</LayoutHeader>
      <LayoutNav>
        <Nav docs={mockDocs} asPath={asPath} collapsible />
      </LayoutNav>
      <LayoutContent>
        <header className={cn('mb-6 mt-8 border-b', 'border-outline-variant/50')}>
          <h1 className="mb-2 text-5xl font-bold tracking-tighter">Getting Started</h1>
          <p className={cn('my-2 text-base leading-5', 'text-on-surface-variant/50')}>
            Introduction to the documentation system
          </p>
        </header>
        <div className="prose prose-invert max-w-none">
          <h2>Welcome</h2>
          <p>
            This is a sample documentation page showing how content is rendered in the documentation
            system.
          </p>
          <h3>Features</h3>
          <ul>
            <li>Responsive layout with navigation</li>
            <li>Search functionality</li>
            <li>MDX content support</li>
            <li>Theme customization</li>
          </ul>
          <h3>Code Example</h3>
          <pre>
            <code>{`import { Canvas } from '@react-three/fiber'

function App() {
  return (
    <Canvas>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </Canvas>
  )
}`}</code>
          </pre>
        </div>
      </LayoutContent>
      <LayoutAside>
        <div className="text-sm text-on-surface-variant/50">Table of Contents</div>
      </LayoutAside>
    </Layout>
  )
}

const meta = {
  title: 'Pages/Documentation',
  component: MockDocumentationPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof MockDocumentationPage>

export default meta
type Story = StoryObj<typeof meta>

export const SampleDocPage: Story = {
  name: 'Sample Documentation Page',
}
