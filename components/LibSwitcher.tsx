import clsx from 'clsx'
import SimpleModal from 'components/Modal'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSpring, animated as a, useTransition, useChain } from 'react-spring'
import {
  switcherContentRef,
  switcherModalRef,
  switcherWrapperRef,
  useSwitcher,
} from 'store/switcher'
import { useRouter } from 'next/router'
import { useMenu } from 'store/menu'

const deafultBoundingClientRect = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
}

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
  // {
  //   id: 'Zustand',
  //   label: 'Zustand',
  // },
  // {
  //   id: 'Component Material',
  //   label: 'Component Material',
  // },
  // {
  //   id: 'Valtio',
  //   label: 'Valtio',
  // },
]

function SwitcherContent({ open, callback }) {
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

  const handleClick = useCallback(
    (path) => {
      if (router.query.slug[0] !== path) {
        router.push(`/${path}`)
      }
      callback()
    },
    [router, callback]
  )

  return (
    <div className="space-y-4 pb-4 mx-4">
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
  const [localIsOpen, setLocalIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>()
  const localIsOpenRef = useRef(localIsOpen)
  const [boundingClientRect, setBoundingClientRect] = useState(deafultBoundingClientRect)
  const { isSwitcherOpen, setIsSwitcherOpen } = useSwitcher()
  const { isMenuOpen } = useMenu()
  const labelSizeClasses = 'p-2 px-3'
  const { query } = useRouter()

  const toggleSwitcher = useCallback(() => setLocalIsOpen((s) => !s), [setLocalIsOpen])

  const { top } = useSpring({
    ref: switcherWrapperRef,
    top: localIsOpen ? 10 : boundingClientRect.y,
    immediate: !isSwitcherOpen && !localIsOpen,
    onRest: () =>
      !localIsOpenRef.current && isSwitcherOpen && setIsSwitcherOpen(localIsOpenRef.current),
  })

  useChain(
    localIsOpen
      ? [switcherWrapperRef, switcherModalRef, switcherContentRef]
      : [switcherContentRef, switcherModalRef, switcherWrapperRef],
    [0, 0.35]
  )

  useEffect(() => setBoundingClientRect(ref.current.getBoundingClientRect()), [
    isMenuOpen,
    setBoundingClientRect,
  ])

  useEffect(() => {
    localIsOpenRef.current = localIsOpen
    if (localIsOpen) {
      setIsSwitcherOpen(true)
    }
  }, [localIsOpen, setIsSwitcherOpen])

  return (
    <>
      <SimpleModal open={localIsOpen}>
        <SwitcherContent open={localIsOpen} callback={toggleSwitcher} />
      </SimpleModal>
      <div ref={ref} className={clsx('opacity-0 mx-1 capitalize', labelSizeClasses)}>
        {query.slug[0].split('-').join(' ')}
      </div>
      <a.div
        style={{
          top,
          width: boundingClientRect.width,
          height: boundingClientRect.height,
          left: boundingClientRect.x,
        }}
        className={clsx(
          'fixed z-50 text-white rounded-md font-semibold bg-black cursor-pointer capitalize',
          labelSizeClasses
        )}
        onClick={toggleSwitcher}
      >
        {query.slug[0].split('-').join(' ')}
      </a.div>
    </>
  )
}
