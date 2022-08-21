import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Icon from 'components/Icon'
import libs from 'data/libraries'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>pmnd.rs docs</title>
      </Head>
      <div className="min-h-screen p-8 lg:p-32 bg-gray-50">
        <Link href="/">
          <a aria-label="Poimandres Docs" className="p-2 block text-3xl text-center lg:text-left">
            <span className="font-bold">Pmndrs</span>
            <span className="font-normal">.docs</span>
          </a>
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 lg:gap-12 w-full max-w-8xl mt-8 lg:mt-20">
          {Object.entries(libs).map(([id, data]) => (
            <div
              key={id}
              className="relative shadow-lg border border-gray-200 bg-white rounded-md font-normal overflow-hidden"
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
                          layout="fill"
                          className="object-contain"
                          alt={data.title}
                          aria-hidden
                        />
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex w-full border-t border-gray-200 divide-x divide-gray-200">
                  <Link href={data.url}>
                    <a className="inline-flex items-center space-x-2 w-1/2 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <Icon icon="docs" />
                      <span className="sm:hidden">Docs</span>
                      <span className="hidden sm:inline">Documentation</span>
                    </a>
                  </Link>
                  <a
                    href={data.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 w-1/2 px-6 py-4 hover:bg-gray-50 transition-colors"
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
    </>
  )
}
