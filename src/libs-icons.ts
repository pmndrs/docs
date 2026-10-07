import docsIcon from '@/assets/docs-icon.png'
import dreiIcon from '@/assets/drei-icon.svg'
import jotaiIcon from '@/assets/jotai-icon.png'
import ppIcon from '@/assets/pp-icon.svg'
import r3fIcon from '@/assets/r3f-icon.svg'
import reactSpringIcon from '@/assets/react-spring-icon.svg'
import uiKitIcon from '@/assets/uikit-icon.svg'
import zustandIcon from '@/assets/zustand-icon.svg'
import type { libs } from '@/libs'
import type { StaticImageData } from 'next/image'

/**
 * The icons of `libs`, for the libraries that have one.
 *
 * Kept apart from `@/libs` because they are assets, imported the Next way: `@/libs` stays
 * readable outside Next.
 */
export const libsIcons: Partial<Record<keyof typeof libs, StaticImageData>> = {
  'react-three-fiber': r3fIcon,
  'react-spring': reactSpringIcon,
  drei: dreiIcon,
  zustand: zustandIcon,
  jotai: jotaiIcon,
  'react-postprocessing': ppIcon,
  uikit: uiKitIcon,
  docs: docsIcon,
}
