import Head from 'next/head'
import Link from 'next/link'

import { data } from '../data/libraries'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>pmnd.rs docs</title>
      </Head>
      <div className="min-h-screen p-8 lg:p-32 bg-gray-50">
        <Link href="/">
          <a className="block text-3xl text-center lg:text-left">
            <span className="font-bold cursor-pointer">Pmndrs</span>
            <span className="font-normal cursor-pointer">.docs</span>
          </a>
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 lg:gap-12 w-full max-w-8xl mt-8 lg:mt-20">
          {data.map((item) => (
            <div
              key={item.id}
              className="relative shadow-lg border border-gray-200 bg-white rounded-md font-normal overflow-hidden"
            >
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center px-6 space-x-6">
                  <div>
                    <div className="pt-4 font-bold text-lg">{item.label}</div>
                    <div className="flex-grow pt-1 pb-4 text-base text-gray-500 !leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className="flex w-full border-t border-gray-200 divide-x divide-gray-200">
                  <Link href={item.id}>
                    <a className="inline-flex items-center space-x-2 w-1/2 px-6 py-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        className="flex-shrink-0 w-5 h-5"
                      >
                        <path
                          d="M2.5 1C1.675781 1 1 1.675781 1 2.5L1 12.5C1 13.324219 1.675781 14 2.5 14L12.5 14C13.324219 14 14 13.324219 14 12.5L14 2.5C14 1.675781 13.324219 1 12.5 1 Z M 2.5 2L12.5 2C12.78125 2 13 2.21875 13 2.5L13 12.5C13 12.78125 12.78125 13 12.5 13L2.5 13C2.21875 13 2 12.78125 2 12.5L2 2.5C2 2.21875 2.21875 2 2.5 2 Z M 4 5L4 6L11 6L11 5 Z M 4 7L4 8L11 8L11 7 Z M 4 9L4 10L9 10L9 9Z"
                          fill="#0F0F0F"
                        />
                      </svg>
                      <span>Documentation</span>
                    </a>
                  </Link>
                  <a
                    href={item.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 w-1/2 px-6 py-4"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      className="flex-shrink-0 w-5 h-5"
                    >
                      <path
                        d="M7.5 1C3.910156 1 1 3.90625 1 7.488281C1 10.355469 2.863281 12.789063 5.445313 13.648438C5.769531 13.707031 6 13.375 6 13.125C6 12.972656 6.003906 12.789063 6 12.25C4.191406 12.640625 3.625 11.375 3.625 11.375C3.328125 10.625 2.96875 10.410156 2.96875 10.410156C2.378906 10.007813 3.011719 10.019531 3.011719 10.019531C3.664063 10.0625 4 10.625 4 10.625C4.5 11.5 5.628906 11.414063 6 11.25C6 10.851563 6.042969 10.5625 6.152344 10.378906C4.109375 10.019531 2.996094 8.839844 3 7.207031C3.003906 6.242188 3.335938 5.492188 3.875 4.9375C3.640625 4.640625 3.480469 3.625 3.960938 3C5.167969 3 5.886719 3.871094 5.886719 3.871094C5.886719 3.871094 6.453125 3.625 7.496094 3.625C8.542969 3.625 9.105469 3.859375 9.105469 3.859375C9.105469 3.859375 9.828125 3 11.035156 3C11.515625 3.625 11.355469 4.640625 11.167969 4.917969C11.683594 5.460938 12 6.210938 12 7.207031C12 8.839844 10.890625 10.019531 8.851563 10.375C8.980469 10.570313 9 10.84375 9 11.25C9 12.117188 9 12.910156 9 13.125C9 13.375 9.226563 13.710938 9.558594 13.648438C12.140625 12.785156 14 10.355469 14 7.488281C14 3.90625 11.089844 1 7.5 1Z"
                        fill="#0F0F0F"
                      />
                    </svg>
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
              {item?.image && (
                <>
                  <div className="absolute inset-0 z-0">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover object-top opacity-30"
                      alt=""
                      aria-hidden
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
