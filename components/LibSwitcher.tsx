import clsx from 'clsx'
import SimpleModal from 'components/Modal'
import { useCallback, useEffect, useState } from 'react'
import { animated as a, useTransition, useChain } from 'react-spring'
import { switcherContentRef, switcherModalRef, useSwitcher } from 'store/switcher'
import { useRouter } from 'next/router'
import useKeyPress from 'hooks/useKeyPress'

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
    id: 'react-postprocessing',
    label: 'React Postprocessing',
  },
]

function SwitcherContent({ open, handleClick }) {
  const router = useRouter()

  const transitions = useTransition(open ? data : [], (item) => item.id, {
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
    <div className="space-y-4 py-16 mx-4">
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
    (path) => {
      toggleSwitcher()
      if (router.query.slug[0] !== path) {
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
