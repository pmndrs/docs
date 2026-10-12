import type { MdxBuildContext } from './mdxContext'
export { getMdxBuildContext } from './mdxContext'
export type { MdxBuildContext } from './mdxContext'
import { createElement, type ComponentType, type ReactNode } from 'react'

/** Both representations receive the same props. Keep this server module separate from client UI. */
export function defineMdxComponent<Props extends object>({
  component,
  toMarkdown,
}: {
  component: ComponentType<Props>
  toMarkdown: (props: Props, context: MdxBuildContext) => string | Promise<string>
}) {
  function LocalMdxComponent(props: Props): ReactNode {
    return createElement(component, props)
  }
  return Object.assign(LocalMdxComponent, { toMarkdown })
}
