import docsIcon from '@/assets/docs-icon.png'
import dreiIcon from '@/assets/drei-icon.svg'
import jotaiIcon from '@/assets/jotai-icon.png'
import ppIcon from '@/assets/pp-icon.svg'
import r3fIcon from '@/assets/r3f-icon.svg'
import reactSpringIcon from '@/assets/react-spring-icon.svg'
import uiKitIcon from '@/assets/uikit-icon.svg'
import zustandIcon from '@/assets/zustand-icon.svg'
import Icon from '@/components/Icon'
import { svg } from '@/utils/icon'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export interface Library {
  title: string
  docs_url: string
  github: string
  description: string
  // Optional banner image
  image?: string
  // Optional project icon
  icon?: string
  iconWidth?: number
  iconHeight?: number
}

export const libs: Record<string, Library> = {
  'react-three-fiber': {
    title: 'React Three Fiber',
    docs_url: 'https://pmndrs.github.io/react-three-fiber',
    github: 'https://github.com/pmndrs/react-three-fiber',
    description: 'React-three-fiber is a React renderer for three.js',
    icon: r3fIcon.src,
    iconWidth: r3fIcon.width,
    iconHeight: r3fIcon.height,
  },
  'react-spring': {
    title: 'React Spring',
    docs_url: 'https://react-spring.io',
    github: 'https://github.com/pmndrs/react-spring',
    description: 'Bring your components to life with simple spring animation primitives for React',
    icon: reactSpringIcon.src,
    iconWidth: reactSpringIcon.width,
    iconHeight: reactSpringIcon.height,
  },
  drei: {
    title: 'Drei',
    docs_url: 'https://pmndrs.github.io/drei',
    github: 'https://github.com/pmndrs/drei',
    description:
      'Drei is a growing collection of useful helpers and abstractions for react-three-fiber',
    icon: dreiIcon.src,
    iconWidth: dreiIcon.width,
    iconHeight: dreiIcon.height,
  },
  zustand: {
    title: 'Zustand',
    docs_url: 'https://pmndrs.github.io/zustand',
    github: 'https://github.com/pmndrs/zustand',
    description:
      'Zustand is a small, fast and scalable bearbones state-management solution, it has a comfy api based on hooks',
    icon: zustandIcon.src,
    iconWidth: zustandIcon.width,
    iconHeight: zustandIcon.height,
  },
  jotai: {
    title: 'Jotai',
    docs_url: 'https://jotai.org/docs/introduction',
    github: 'https://github.com/pmndrs/jotai',
    description: 'Jotai is a primitive and flexible state management library for React',
    icon: jotaiIcon.src,
    iconWidth: jotaiIcon.width,
    iconHeight: jotaiIcon.height,
  },
  valtio: {
    title: 'Valtio',
    docs_url: 'https://valtio.pmnd.rs',
    github: 'https://github.com/pmndrs/valtio',
    description: 'Valtio makes proxy-state simple for React and Vanilla',
  },
  a11y: {
    title: 'A11y',
    docs_url: 'https://pmndrs.github.io/react-three-a11y',
    github: 'https://github.com/pmndrs/react-three-a11y',
    description:
      '@react-three/a11y brings accessibility to webGL with easy-to-use react-three-fiber components',
  },
  'react-postprocessing': {
    title: 'React Postprocessing',
    docs_url: 'https://pmndrs.github.io/react-postprocessing',
    github: 'https://github.com/pmndrs/react-postprocessing',
    description: 'React Postprocessing is a postprocessing wrapper for @react-three/fiber',
    icon: ppIcon.src,
    iconWidth: ppIcon.width,
    iconHeight: ppIcon.height,
  },
  uikit: {
    title: 'uikit',
    docs_url: 'https://pmndrs.github.io/uikit/docs',
    github: 'https://github.com/pmndrs/uikit',
    description: 'uikit brings user interfaces to @react-three/fiber',
    icon: uiKitIcon.src,
    iconWidth: uiKitIcon.width,
    iconHeight: uiKitIcon.height,
  },
  xr: {
    title: 'xr',
    docs_url: 'https://pmndrs.github.io/xr/docs',
    github: 'https://github.com/pmndrs/xr',
    description: 'VR/AR for @react-three/fiber',
  },
  docs: {
    title: 'Docs',
    docs_url: '/getting-started/introduction',
    github: 'https://github.com/pmndrs/docs',
    description: 'Documentation generator for `pmndrs/*`',
    icon: docsIcon.src,
    iconWidth: docsIcon.width,
    iconHeight: docsIcon.height,
  },
  prai: {
    title: 'prai',
    docs_url: 'https://pmndrs.github.io/prai',
    github: 'https://github.com/pmndrs/prai',
    description: 'JS Framework for building step-by-step LLM instructions`',
  },
  viverse: {
    title: 'viverse',
    docs_url: 'https://pmndrs.github.io/viverse',
    github: 'https://github.com/pmndrs/viverse',
    description: 'Toolkit for building Three.js and React Three Fiber Apps for VIVERSE and beyond.',
  },
  leva: {
    title: 'leva',
    docs_url: 'https://pmndrs.github.io/leva',
    github: 'https://github.com/pmndrs/leva',
    description: 'React-first components GUI',
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
              <span className="sm:hidden">docs</span>
              <span className="hidden sm:inline">documentation</span>
            </Link>
            .<Link href="https://pmnd.rs">pmnd.rs</Link>
          </header>

          <main className="max-w-8xl mt-8 grid w-full grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-12 2xl:grid-cols-3">
            {Object.entries(libs).map(([id, data]) => (
              <div
                key={id}
                className="group/card bg-surface-container relative overflow-hidden rounded-md border border-outline-variant font-normal"
              >
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between gap-6 px-6 py-6">
                    <div className="max-w-md">
                      <div className="text-lg font-bold">{data.title}</div>
                      <div className="grow text-sm leading-relaxed! text-on-surface-variant/50">
                        {data.description}
                      </div>
                    </div>
                    {data.icon && (
                      <a
                        href={data.github}
                        target="_blank"
                        rel="noopener"
                        className="relative block h-20 w-20 shrink-0"
                      >
                        <Image
                          src={data.icon}
                          className="absolute inset-0 h-full w-full object-contain grayscale transition group-hover/card:grayscale-0"
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
                      href={data.docs_url}
                      className="bg-surface-container inline-flex flex-1 items-center space-x-2 px-6 py-4 transition-colors"
                    >
                      <Icon icon="docs" />
                      <span className="sm:hidden">Docs</span>
                      <span className="hidden sm:inline">Documentation</span>
                    </Link>
                    <a
                      href={data.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-surface-container inline-flex flex-1 items-center space-x-2 px-6 py-4 transition-colors"
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
