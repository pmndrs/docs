import { Component, useMemo, useState, type ComponentProps } from 'react'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import * as Tree from '.'
import { flatten } from '.'

/**
 *
 *
 * ## Anatomy
 *
 * ```tsx
 * <Tree.Root>
 *   <Tree.Item nodeId hasChildNodes></Tree.Item>
 *   <Tree.Group parentId />
 *     ...
 *   <Tree.Group>
 *   ...
 * </Tree.Root>
 * ```
 */

const meta: Meta<typeof Tree.Root> = {
  title: 'primitives/Tree',
  component: Tree.Root,
  args: {
    defaultOpenKeys: ['composables', 'components', 'Home'],
    defaultSelectedKeys: ['useAuth.ts', 'Home'],
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tree.Root>

//

const TreeGroup = (props: ComponentProps<typeof Tree.Group>) => (
  <Tree.Group {...props} className="ml-4 aria-hidden:hidden" />
)
const TreeItem = (props: ComponentProps<typeof Tree.Item>) => (
  <Tree.Item
    {...props}
    className="aria-[selected]:bg-green-500 [&+[role=group]]:aria-[selected]:bg-green-400"
  />
)

/**
 * Dumb/fully declarative tree.
 *
 * Item/group are manually linked together, through `nodeId`/`parentId`.
 * Item has to declare if it `hasChildNodes`
 */

export const St1: Story = {
  name: 'Default',
  args: {},
  render: (args) => (
    <Tree.Root {...args}>
      <TreeItem nodeId="composables" hasChildNodes>
        📁 composables - 🧩
      </TreeItem>
      <TreeGroup parentId="composables">
        <TreeItem nodeId="useAuth.ts">📄 useAuth.ts - 🔑</TreeItem>
        <TreeItem nodeId="useUser.ts">📄 useUser.ts - 🧍🏼</TreeItem>
      </TreeGroup>
      <TreeItem nodeId="components" hasChildNodes>
        📁 components - 🧱
      </TreeItem>
      <TreeGroup parentId="components">
        <TreeItem nodeId="Home" hasChildNodes>
          📁 Home - 🏠
        </TreeItem>
        <TreeGroup parentId="Home">
          <TreeItem nodeId="Card.vue">📄 Card.vue - 💳</TreeItem>
          <TreeItem nodeId="Button.vue">📄 Button.vue - 🔵</TreeItem>
        </TreeGroup>
      </TreeGroup>
      <TreeItem nodeId="app.vue">📄 app.vue - 👩🏻‍💻</TreeItem>
      <TreeItem nodeId="nuxt.config.ts">📄 nuxt.config.ts - 🔺</TreeItem>
    </Tree.Root>
  ),
}

//

// export const St2: Story = {
//     name: 'Multiselect',
//     args: {
//         multiselect: true,
//     },
//     render: (args) => (
//         <Tree.Root {...args} >
//             <TreeItem nodeId="root" hasChildNodes>
//                 Root Item
//             </TreeItem>
//             <TreeGroup parentId="root">
//                 <TreeItem nodeId="node-1">Child 1</TreeItem>
//                 <TreeItem nodeId="node-2">Child 2</TreeItem>
//             </TreeGroup>
//         </Tree.Root>
//     ),
// };

//

type MyNode = { id: string; icon: string; nodes?: MyNode[] }

const items: MyNode[] = [
  {
    id: 'composables',
    icon: '🧩',
    nodes: [
      { id: 'useAuth.ts', icon: '🔑' },
      { id: 'useUser.ts', icon: '🧍🏼' },
    ],
  },
  {
    id: 'components',
    icon: '🧱',
    nodes: [
      {
        id: 'Home',
        icon: '🏠',
        nodes: [
          { id: 'Card.vue', icon: '💳' },
          { id: 'Button.vue', icon: '🔵' },
        ],
      },
    ],
  },
  { id: 'app.vue', icon: '👩🏻‍💻' },
  { id: 'nuxt.config.ts', icon: '🔺' },
]
const defaultOpenKeys = ['composables', 'components', 'Home']
const defaultSelectedKeys = ['useAuth.ts', 'Home']

/**
 * Item/group are automatically linked together given `items` structure.
 *
 * ## Anatomy
 *
 * ```tsx
 * <Tree.Factory items Item Group />
 * ```
 */

export const St3: StoryObj<typeof Tree.Factory> = {
  name: 'Tree.Factory',
  render: () => (
    <Tree.Factory
      items={items}
      defaultOpenKeys={defaultOpenKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      Item={({ id, nodes, icon }) => (
        <p className="aria-[selected]:bg-green-500 [&+[role=group]]:aria-[selected]:bg-green-400">
          {nodes ? `📁` : `📄`} {id} - {icon}
        </p>
      )}
      Group={({ children }) => <div className="ml-4 aria-hidden:hidden">{children}</div>}
    />
  ),
}

/**
 * `items` are rendered in a (flat) virtualized list, with computed additional VItem props: `depth`, `hasChildNodes`.
 *
 * ## Anatomy
 *
 * ```tsx
 * <Tree.Factory flatItems virtualized VItem />
 * ```
 */

function Scene4(props: ComponentProps<typeof Tree.Factory>) {
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys)
  const flatItems = useMemo(() => flatten(items, new Set(openKeys)), [openKeys])

  return (
    <Tree.Factory
      flatItems={flatItems}
      openKeys={openKeys}
      onOpenKeysChange={setOpenKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      virtualized
      VItem={({ depth, id, icon, hasChildNodes }) => (
        <p className="aria-[selected]:bg-green-500" style={{ marginLeft: `${depth * 16}px` }}>
          {hasChildNodes ? `📁` : `📄`} {id} - {icon}
        </p>
      )}
    />
  )
}

export const St4: StoryObj<typeof Tree.Factory> = {
  name: 'Tree.Factory virtualized',
  render: (args) => <Scene4 {...args} />,
}
