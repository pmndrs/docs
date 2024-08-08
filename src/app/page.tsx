import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Icon from '@/components/Icon'
import libs from '@/data/libraries'
import ToggleTheme from '@/components/ToggleTheme'

export default function HomePage() {
  return (
    <>
      {/* <Head>
        <title>pmnd.rs docs</title>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#000000" />
        <meta name="apple-mobile-web-app-title" content="PMNDRS" />
        <meta name="application-name" content="PMNDRS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-navbutton-color" content="#000000" />
        <meta name="msapplication-starturl" content="https://pmnd.rs/" />
        <meta name="msapplication-tilecolor" content="#000000" />
        <meta name="msapplication-tileimage" content="/mstile-144x144.png" />
        <meta name="msapplication-tooltip" content="PMNDRS" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@pmndrs" />
        <meta name="twitter:site" content="@pmndrs" />
        <meta property="og:locale" content="en_us" />
        <meta property="og:type" content="website" />
      </Head> */}
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
            <ToggleTheme />
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
