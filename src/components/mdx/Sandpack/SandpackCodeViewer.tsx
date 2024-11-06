'use client'

import {
  CodeViewerProps,
  SandpackFiles,
  SandpackCodeViewer as SPCodeViewer,
  useSandpack,
} from '@codesandbox/sandpack-react'

import { useEffect, useState } from 'react'
import './Sandpack.css'

type Decorators = CodeViewerProps['decorators']

export function SandpackCodeViewer(
  props: CodeViewerProps & { filesDecorators?: Record<keyof SandpackFiles, Decorators> },
) {
  const { sandpack } = useSandpack()
  const { activeFile } = sandpack

  const { filesDecorators, ...restCodeViewerProps } = props ?? {}

  const [decorators, setDecorators] = useState<Decorators>(undefined)
  useEffect(() => {
    if (!filesDecorators) return

    setDecorators(filesDecorators[activeFile])
  }, [activeFile, filesDecorators])

  return <SPCodeViewer {...restCodeViewerProps} decorators={decorators} />
}
