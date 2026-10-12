import { createElement, type ComponentType, type ReactNode } from 'react'

/** Both representations receive the same props. Keep this server module separate from client UI. */
export function defineMdxComponent<Props extends object>({
  component,
  toMarkdown,
}: {
  component: ComponentType<Props>
  toMarkdown: (props: Props) => string | Promise<string>
}) {
  function LocalMdxComponent(props: Props): ReactNode {
    return createElement(component, props)
  }
  return Object.assign(LocalMdxComponent, { toMarkdown })
}
