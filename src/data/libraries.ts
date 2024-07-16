import reactThreeFiberShare from 'assets/react-three-fiber.jpg'
import zustandShare from 'assets/zustand.jpg'
import zustandIcon from 'assets/zustand-icon.png'
import jotaiIcon from 'assets/jotai-icon.png'
import reactThreeA11yShare from 'assets/react-three-a11y.jpg'
import reactPostprocessingShare from 'assets/react-postprocessing.jpg'

export interface Library {
  title: string
  url: string
  github: string
  description: string
  // Optional banner image
  image?: string
  // Optional project icon
  icon?: string
  // Optional repository to fetch and serve docs from
  // <user>/<repo>/<branch>/<path/to/dir>
  docs?: string
}

const libraries: Record<string, Library> = {
  xr: {
    title: 'xr',
    url: '/xr',
    github: 'https://github.com/pmndrs/react-xr',
    description: 'VR/AR for @react-three/fiber',
    docs: 'pmndrs/react-xr/main/docs',
  },
}

export default libraries
