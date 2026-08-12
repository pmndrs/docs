'use client'

import cn from '@/lib/cn'
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackProviderProps,
} from '@codesandbox/sandpack-react'
import { ComponentProps } from 'react'
import { SandpackCodeViewer } from './SandpackCodeViewer'

export function SandpackClient({
  className,
  fileExplorer,
  codeEditor,
  codeViewer,
  preview,
  ...props
}: SandpackProviderProps & {
  className?: string
  codeEditor?: ComponentProps<typeof SandpackCodeEditor>
  codeViewer?: boolean | ComponentProps<typeof SandpackCodeViewer>
  preview?: ComponentProps<typeof SandpackPreview>
  fileExplorer?: boolean | ComponentProps<typeof SandpackFileExplorer>
}) {
  return (
    <div className={cn(className, 'sandpack')}>
      <SandpackProvider
        {...props}
        theme={{
          colors: {
            surface1: 'var(--mcu-surface-container-low)',
            surface2: 'var(--mcu-surface-container)',
            surface3: 'var(--mcu-surface-container-high)',
          },
          font: {
            mono: 'var(--font-mono)',
          },
        }}
        // @ts-ignore
        style={{ '--sp-border-radius': '0.5rem' }}
      >
        <SandpackLayout>
          {fileExplorer && (
            <SandpackFileExplorer
              {...(typeof fileExplorer !== 'boolean' ? fileExplorer : undefined)}
            />
          )}
          {codeViewer ? (
            <SandpackCodeViewer {...(typeof codeViewer !== 'boolean' ? codeViewer : undefined)} />
          ) : (
            <SandpackCodeEditor showTabs={fileExplorer ? false : undefined} {...codeEditor} />
          )}

          <SandpackPreview {...preview} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
