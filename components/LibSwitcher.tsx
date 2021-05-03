import clsx from 'clsx'
import SimpleModal from 'components/Modal'
import { useCallback, useEffect, useState } from 'react'
import { animated as a, useTransition, useChain } from 'react-spring'
import { switcherContentRef, switcherModalRef, useSwitcher } from 'store/switcher'
import { useRouter } from 'next/router'
import useKeyPress from 'hooks/useKeyPress'
import { Close } from './Icons'
import { useMemo } from 'react'

const data = [
  {
    id: 'react-three-fiber',
    label: 'React Three Fiber',
  },
  {
    id: 'react-spring',
    label: 'React Spring',
  },
  {
    id: 'drei',
    label: 'Drei',
  },
  {
    id: 'zustand',
    label: 'Zustand',
  },
  {
    id: 'jotai',
    label: 'Jotai',
  },
  {
    id: 'a11y',
    label: 'A11y',
  },
  {
    id: 'react-postprocessing',
    label: 'React Postprocessing',
  },
]

function SwitcherContent({ open, handleClick }) {
  const router = useRouter()

  const _data = useMemo(() => data.filter(({ id }) => id !== router.query.slug[0]), [router])

  const transitions = useTransition(open ? _data : [], (item) => item.id, {
    ref: switcherContentRef,
    unique: true,
    trail: 100,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      tension: 280,
      friction: 28,
    },
  })

  return (
    <div className="space-y-4 py-8 mx-4">
      {transitions.map(({ item, props, key }) => (
        <a.div
          key={key}
          style={props}
          className={clsx(
            'font-bold text-center text-2xl rounded-md p-16',
            router.query.slug[0] === key
              ? 'text-white bg-black hover:bg-black'
              : 'font-bold cursor-pointer bg-gray-200 hover:bg-black hover:text-white'
          )}
          onClick={() => handleClick(item.id)}
        >
          {item.label}
        </a.div>
      ))}
    </div>
  )
}

export default function LibSwitcher() {
  const { isSwitcherOpen, setIsSwitcherOpen, toggleSwitcher } = useSwitcher()
  const labelSizeClasses = 'block px-6 py-2'
  const { query } = useRouter()
  const escPressed = useKeyPress('Escape')
  const router = useRouter()

  const handleClick = useCallback(
    (path?: string) => {
      toggleSwitcher()
      if (path && router.query.slug[0] !== path) {
        router.push(`/${path}`)
      }
    },
    [router, toggleSwitcher]
  )

  useChain(
    isSwitcherOpen
      ? [switcherModalRef, switcherContentRef]
      : [switcherContentRef, switcherModalRef],
    [0, 0.35]
  )

  useEffect(() => {
    if (escPressed) {
      setIsSwitcherOpen(false)
    }
  }, [escPressed])

  return (
    <>
      <SimpleModal open={isSwitcherOpen}>
        <div className="sticky top-0 left-0 right-0 grid grid-cols-3 bg-black text-white h-16">
          <div className="flex items-center flex-none pl-4 border-b border-gray-200 sm:pl-6 xl:pl-8 lg:border-b-0 lg:w-60 xl:w-72">
            <span className="font-bold cursor-pointer">Pmndrs</span>
            <span className="font-normal cursor-pointer">.docs</span>
          </div>
          <div className="flex justify-center items-center font-semibold capitalize">
            <span className="hidden md:inline">{query.slug[0].replace(/\-/g, ' ')}</span>
          </div>
          <div className="flex justify-end items-center h-16">
            <Close className="m-4 w-8 h-8 cursor-pointer" onClick={() => handleClick()} />
          </div>
        </div>
        <SwitcherContent open={isSwitcherOpen} handleClick={handleClick} />
      </SimpleModal>
      <div
        className={clsx(
          'z-50 text-white rounded-md font-semibold bg-black cursor-pointer capitalize',
          labelSizeClasses
        )}
        onClick={toggleSwitcher}
      >
        {query.slug[0].replace(/\-/g, ' ')}
      </div>
    </>
  )
}
