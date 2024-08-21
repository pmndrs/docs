import Image from 'next/image'
import Link from 'next/link'

import docsIcon from '@/assets/docs-icon.png'
import docsShare from '@/assets/docs.jpg'
import jotaiIcon from '@/assets/jotai-icon.png'
import reactPostprocessingShare from '@/assets/react-postprocessing.jpg'
import reactThreeA11yShare from '@/assets/react-three-a11y.jpg'
import reactThreeFiberShare from '@/assets/react-three-fiber.jpg'
import zustandIcon from '@/assets/zustand-icon.png'
import zustandShare from '@/assets/zustand.jpg'
import Icon from '@/components/Icon'
import { svg } from '@/utils/icon'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export interface Library {
  title: string
  url: string
  github: string
  description: string
  // Optional banner image
  image?: string
  // Optional project icon
  icon?: string
  iconWidth?: number
  iconHeight?: number
  // Optional repository to fetch and serve docs from
  // <user>/<repo>/<branch>/<path/to/dir>
  docs?: string
}

const libs: Record<string, Library> = {
  'react-three-fiber': {
    title: 'React Three Fiber',
    url: '/react-three-fiber',
    github: 'https://github.com/pmndrs/react-three-fiber',
    description: 'React-three-fiber is a React renderer for three.js',
    image: reactThreeFiberShare.src,
    docs: 'pmndrs/react-three-fiber/master/docs',
  },
  'react-spring': {
    title: 'React Spring',
    url: 'https://react-spring.io',
    github: 'https://github.com/pmndrs/react-spring',
    description: 'Bring your components to life with simple spring animation primitives for React',
  },
  drei: {
    title: 'Drei',
    url: 'https://github.com/pmndrs/drei#readme',
    github: 'https://github.com/pmndrs/drei',
    description:
      'Drei is a growing collection of useful helpers and abstractions for react-three-fiber',
  },
  zustand: {
    title: 'Zustand',
    url: '/zustand',
    github: 'https://github.com/pmndrs/zustand',
    description:
      'Zustand is a small, fast and scalable bearbones state-management solution, it has a comfy api based on hooks',
    icon: zustandIcon.src,
    iconWidth: zustandIcon.width,
    iconHeight: zustandIcon.height,
    image: zustandShare.src,
    docs: 'pmndrs/zustand/main/docs',
  },
  jotai: {
    title: 'Jotai',
    url: 'https://jotai.org/docs/introduction',
    github: 'https://github.com/pmndrs/jotai',
    description: 'Jotai is a primitive and flexible state management library for React',
    icon: jotaiIcon.src,
    iconWidth: jotaiIcon.width,
    iconHeight: jotaiIcon.height,
  },
  valtio: {
    title: 'Valtio',
    url: 'https://valtio.pmnd.rs',
    github: 'https://github.com/pmndrs/valtio',
    description: 'Valtio makes proxy-state simple for React and Vanilla',
  },
  a11y: {
    title: 'A11y',
    url: '/a11y',
    github: 'https://github.com/pmndrs/react-three-a11y',
    description:
      '@react-three/a11y brings accessibility to webGL with easy-to-use react-three-fiber components',
    image: reactThreeA11yShare.src,
    docs: 'pmndrs/react-three-a11y/main/docs',
  },
  'react-postprocessing': {
    title: 'React Postprocessing',
    url: '/react-postprocessing',
    github: 'https://github.com/pmndrs/react-postprocessing',
    description: 'React Postprocessing is a postprocessing wrapper for @react-three/fiber',
    image: reactPostprocessingShare.src,
    docs: 'pmndrs/react-postprocessing/master/docs',
  },
  uikit: {
    title: 'uikit',
    url: '/uikit',
    github: 'https://github.com/pmndrs/uikit',
    description: 'uikit brings user interfaces to @react-three/fiber',
    docs: 'pmndrs/uikit/main/docs',
  },
  xr: {
    title: 'xr',
    url: '/xr',
    github: 'https://github.com/pmndrs/xr',
    description: 'VR/AR for @react-three/fiber',
    docs: 'pmndrs/xr/main/docs',
  },
  docs: {
    title: 'Docs',
    url: '/getting-started/introduction',
    github: 'https://github.com/pmndrs/docs',
    description: 'Documentation generator for `pmndrs/*`',
    image: docsShare.src,
    icon: docsIcon.src,
    iconWidth: docsIcon.width,
    iconHeight: docsIcon.height,
    docs: 'pmndrs/docs/main/docs',
  },
}

const title = 'Poimandres documentation'
const description = `Index of documentation for pmndrs/* libraries`
const icon = []
if (process.env.ICON) {
  icon.push({
    url: `data:image/svg+xml,${encodeURIComponent(svg('🖨️'))}`,
  })
}

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon,
  },
  openGraph: {
    title,
    description,
    images: [{ url: '/logo.png' }],
  },
}

export default function Page() {
  const HOME_REDIRECT = process.env.HOME_REDIRECT
  if (HOME_REDIRECT) redirect(HOME_REDIRECT)

  return (
    <>
      <div className="min-h-screen">
        <div className="px-4 py-8 pb-12 lg:px-28 lg:py-12 lg:pb-20">
          <header className="text-center text-3xl lg:text-left">
            <Link href="/" aria-label="Poimandres Docs" className="font-bold">
              Documentation
            </Link>
            .<Link href="https://pmnd.rs">pmndrs</Link>
          </header>

          <main className="max-w-8xl mt-8 grid w-full grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-12 2xl:grid-cols-3">
            {Object.entries(libs).map(([id, data]) => (
              <div
                key={id}
                className="bg-surface-container relative overflow-hidden rounded-md border border-outline-variant font-normal"
              >
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between px-6">
                    <div className="max-w-md">
                      <div className="pt-4 text-lg font-bold">{data.title}</div>
                      <div className="flex-grow pb-4 pr-4 pt-1 text-sm !leading-relaxed text-on-surface-variant/50">
                        {data.description}
                      </div>
                    </div>
                    {data.icon && (
                      <a
                        href={data.github}
                        target="_blank"
                        rel="noopener"
                        className="relative block h-20 w-20 flex-shrink-0"
                      >
                        <Image
                          src={data.icon}
                          className="absolute inset-0 h-full w-full object-contain"
                          alt={data.title}
                          aria-hidden
                          width={data.iconWidth}
                          height={data.iconHeight}
                        />
                      </a>
                    )}
                  </div>
                  <div className="flex w-full divide-x divide-outline-variant border-t border-outline-variant text-sm">
                    <Link
                      href={data.url}
                      className="interactive-bg-surface-container inline-flex flex-1 items-center space-x-2 px-6 py-4 transition-colors"
                    >
                      <Icon icon="docs" />
                      <span className="sm:hidden">Docs</span>
                      <span className="hidden sm:inline">Documentation</span>
                    </Link>
                    <a
                      href={data.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="interactive-bg-surface-container inline-flex flex-1 items-center space-x-2 px-6 py-4 transition-colors"
                    >
                      <Icon icon="github" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </>
  )
}
