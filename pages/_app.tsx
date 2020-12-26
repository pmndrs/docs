import LibSwitcher from 'components/LibSwitcher'
import { AppProps } from 'next/app'
import '../css/main.css'

function Layout (props) {
  return <>
    <div className="sticky top-0 z-40 lg:z-50 w-full max-w-8xl mx-auto bg-white flex-none flex">
      <div className="flex-none pl-4 sm:pl-6 xl:pl-8 flex items-center border-b border-gray-200 lg:border-b-0 lg:w-60 xl:w-72">
        <span className="font-bold">
        Pmdnrs 
        </span>
        <span className="font-normal">
        .docs
        </span>
      </div>
      <div className="flex-auto border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:mx-6 lg:px-0 xl:mx-8">
        Quick search [⌘ + K]
      </div>
    </div>

    <div className="w-full max-w-8xl mx-auto">
      <div className="lg:flex">
        <div 
          id="sidebar" 
          className="
            fixed 
            z-40 
            inset-0 
            flex-none 
            h-full 
            bg-black 
            bg-opacity-25 
            w-full 
            lg:bg-white 
            lg:static 
            lg:h-auto 
            lg:overflow-y-visible 
            lg:pt-0 
            lg:w-60 
            xl:w-72 
            lg:block hidden
          "
        >
          <div 
            id="nav-wrapper" 
            className="
              h-full
              overflow-y-auto
              scrolling-touch
              lg:h-auto
              lg:block
              lg:relative
              lg:sticky
              lg:bg-transparent
              overflow-hidden
              lg:top-16
              bg-white
              mr-24
              lg:mr-0
            "
          >
            <div id="nav" className="
              px-1 
              pt-6 
              overflow-y-auto 
              font-medium 
              text-base 
              sm:px-3 
              xl:px-5 
              lg:text-sm 
              pb-10 
              lg:pt-10 
              lg:pb-14 
              sticky?lg:h-(screen-16)
            ">

              <div className="mb-4">
                <LibSwitcher />
              </div>

              <h3>Getting started</h3>

              <ul className="font-light">
                <li>Installation</li>
                <li>Creating a store</li>
              </ul>
            </div>
          </div>
        </div>
        <div id="content-wrapper" className="flex-auto">
          <div className="w-full flex">
            <div className="min-w-0 flex-auto px-4 sm:px-6 xl:px-8 pt-10 pb-24 lg:pb-16">
              <div className="prose max-w-none">
                {props.children}
              </div>
            </div>

            <div className="hidden xl:text-sm xl:block flex-none w-64 pl-8 mr-8">
              <div className="flex flex-col justify-between overflow-y-auto sticky max-h-(screen-16) pt-10 pb-6 top-16">
              <h3>On this page</h3>

              <p>
                This will contain page navigation
              </p>
                
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>

  </>
}

function App({ Component, pageProps }: AppProps) {
  return <Layout><Component {...pageProps} /></Layout>
}

export default App
