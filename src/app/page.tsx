import Link from 'next/link'
import Image from 'next/image'

import reactThreeFiberShare from '@/assets/react-three-fiber.jpg'
import zustandShare from '@/assets/zustand.jpg'
import zustandIcon from '@/assets/zustand-icon.png'
import jotaiIcon from '@/assets/jotai-icon.png'
import reactThreeA11yShare from '@/assets/react-three-a11y.jpg'
import reactPostprocessingShare from '@/assets/react-postprocessing.jpg'
import Icon from '@/components/Icon'
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
}

export default function Page() {
  if (process.env.OUTPUT === 'export') redirect('/getting-started/introduction')

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
        <header className="pt-2">
          <div className="max-w-7xl mx-auto flex justify-between">
            <Link
              href="/"
              aria-label="Poimandres Docs"
              className="p-2 block text-3xl text-center lg:text-left"
            >
              <span className="font-bold">Pmndrs</span>
              <span className="font-normal">.docs</span>
            </Link>
            {/* <ToggleTheme /> */}
          </div>
        </header>
        <div className="px-4 pb-4 lg:px-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 lg:gap-12 w-full max-w-8xl mt-8 lg:mt-20">
            {Object.entries(libs).map(([id, data]) => (
              <div
                key={id}
                className="relative shadow-lg border border-gray-200 bg-white rounded-md font-normal overflow-hidden dark:bg-gray-800/30 dark:border-gray-700"
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center px-6">
                    <div className="max-w-md">
                      <div className="pt-4 font-bold text-lg">{data.title}</div>
                      <div className="flex-grow pr-4 pt-1 pb-4 text-base text-gray-500 !leading-relaxed">
                        {data.description}
                      </div>
                    </div>
                    {data.icon && (
                      <div className="relative flex-shrink-0 w-20 h-20">
                        <a href={data.github} target="_blank" rel="noopener" className="block">
                          <Image
                            src={data.icon}
                            className="object-contain"
                            alt={data.title}
                            aria-hidden
                            width={data.iconWidth}
                            height={data.iconHeight}
                          />
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex w-full border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
                    <Link href={data.url}>
                      <span className="inline-flex items-center space-x-2 w-1/2 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Icon icon="docs" />
                        <span className="sm:hidden">Docs</span>
                        <span className="hidden sm:inline">Documentation</span>
                      </span>
                    </Link>
                    <a
                      href={data.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 w-1/2 px-6 py-4 hover:bg-gray-50 transition-colors dark:hover:bg-gray-800"
                    >
                      <Icon icon="github" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
