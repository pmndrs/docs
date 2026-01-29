import * as React from 'react'
import { useMemo } from 'react'

import { composeEventHandlers } from '@radix-ui/primitive'
import { createContextScope, type Scope } from '@radix-ui/react-context'
import { useDirection } from '@radix-ui/react-direction'
import { Primitive } from '@radix-ui/react-primitive'
import * as RovingFocusGroup from '@radix-ui/react-roving-focus'
import { createRovingFocusGroupScope } from '@radix-ui/react-roving-focus'
import { useControllableState } from '@radix-ui/react-use-controllable-state'

/* -------------------------------------------------------------------------------------------------
 * Tree
 * ----------------------------------------------------------------------------------------------- */

const TREE_NAME = 'Tree'

type ScopedProps<P> = P & { __scopeTree?: Scope }

const [createTreeContext, createTreeScope] = createContextScope(TREE_NAME, [
  createRovingFocusGroupScope,
])
const useRovingFocusGroupScope = createRovingFocusGroupScope()

type RovingFocusGroupProps = React.ComponentPropsWithoutRef<typeof RovingFocusGroup.Root>

type TreeContextValue = {
  orientation: RovingFocusGroupProps['orientation']
  dir: RovingFocusGroupProps['dir']
  multiselect: boolean
  openKeys: Set<string>
  onToggleOpen(key: string): void
  selectedKeys: Set<string>
  onSelect(key: string): void
}

const [TreeProvider, useTreeContext] = createTreeContext<TreeContextValue>(TREE_NAME)

type TreeElement = React.ElementRef<typeof Primitive.div>
type TreeProps = React.ComponentPropsWithoutRef<typeof Primitive.div> & {
  orientation?: RovingFocusGroupProps['orientation']
  loop?: RovingFocusGroupProps['loop']
  dir?: RovingFocusGroupProps['dir']
  multiselect?: boolean

  openKeys?: string[]
  onOpenKeysChange?: (openKeys: string[]) => void
  defaultOpenKeys?: string[]

  selectedKeys?: string[]
  onSelectedKeysChange?: (selectedKeys: string[]) => void
  defaultSelectedKeys?: string[]
}

const Tree = React.forwardRef<TreeElement, ScopedProps<TreeProps>>((props, forwardedRef) => {
  const {
    __scopeTree,
    orientation = 'vertical',
    loop = true,
    dir,

    multiselect = false,

    openKeys: openKeysProp,
    onOpenKeysChange,
    defaultOpenKeys = [],

    selectedKeys: selectedKeysProp,
    defaultSelectedKeys = [],
    onSelectedKeysChange,

    ...domProps
  } = props

  // RovingFocus scope for focus management
  const rovingFocusScope = useRovingFocusGroupScope(__scopeTree)

  // useControllableState for open keys
  const [openKeysArray, setOpenKeysArray] = useControllableState<string[]>({
    prop: openKeysProp,
    onChange: onOpenKeysChange,
    defaultProp: defaultOpenKeys,
  })

  // Toggling open/close
  const handleToggleOpen = React.useCallback(
    (key: string) => {
      setOpenKeysArray((prevValue) => {
        const prevSet = new Set(prevValue ?? [])
        if (prevSet.has(key)) {
          prevSet.delete(key)
        } else {
          prevSet.add(key)
        }
        return Array.from(prevSet)
      })
    },
    [setOpenKeysArray],
  )

  // useControllableState for selected keys
  const [selectedKeysArray, setSelectedKeysArray] = useControllableState<string[]>({
    prop: selectedKeysProp,
    onChange: onSelectedKeysChange,
    defaultProp: defaultSelectedKeys,
  })

  const handleSelect = React.useCallback(
    (key: string) => {
      setSelectedKeysArray((prevValue) => {
        const prevSet = new Set(prevValue ?? [])

        if (!multiselect) {
          // single-select
          if (prevSet.has(key)) {
            return []
          } else {
            return [key]
          }
        }

        // multi-select
        if (prevSet.has(key)) {
          prevSet.delete(key)
        } else {
          prevSet.add(key)
        }

        return Array.from(prevSet)
      })
    },
    [multiselect, setSelectedKeysArray],
  )

  // Convert direction + set up the context
  const direction = useDirection(dir)

  // Convert arrays to sets for internal usage
  const openKeysSet = React.useMemo(() => new Set(openKeysArray), [openKeysArray])
  const selectedKeysSet = React.useMemo(() => new Set(selectedKeysArray), [selectedKeysArray])

  return (
    <TreeProvider
      scope={__scopeTree}
      orientation={orientation}
      dir={direction}
      multiselect={multiselect}
      openKeys={openKeysSet}
      onToggleOpen={handleToggleOpen}
      selectedKeys={selectedKeysSet}
      onSelect={handleSelect}
    >
      <RovingFocusGroup.Root
        asChild
        {...rovingFocusScope}
        orientation={orientation}
        dir={direction}
        loop={loop}
      >
        <Primitive.div
          ref={forwardedRef}
          role="tree"
          aria-multiselectable={multiselect || undefined}
          data-orientation={orientation}
          {...domProps}
        />
      </RovingFocusGroup.Root>
    </TreeProvider>
  )
})
Tree.displayName = TREE_NAME

/* -------------------------------------------------------------------------------------------------
 * TreeItem
 * ----------------------------------------------------------------------------------------------- */

type TreeItemElement = React.ElementRef<typeof Primitive.div>
type TreeItemProps = React.ComponentPropsWithoutRef<typeof Primitive.div> & {
  nodeId: string
  hasChildNodes?: boolean
}

const TreeItem = React.forwardRef<TreeItemElement, ScopedProps<TreeItemProps>>(
  (props, forwardedRef) => {
    const { nodeId, hasChildNodes = false, __scopeTree, ...domProps } = props
    const { openKeys, onToggleOpen, selectedKeys, onSelect, orientation } = useTreeContext(
      TREE_NAME,
      __scopeTree,
    )

    const isOpen = openKeys.has(nodeId)
    const isSelected = selectedKeys.has(nodeId)

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        const { key } = event
        if (key === 'ArrowRight') {
          if (!isOpen && hasChildNodes) {
            onToggleOpen(nodeId)
            event.preventDefault()
          }
        } else if (key === 'ArrowLeft') {
          if (isOpen && hasChildNodes) {
            onToggleOpen(nodeId)
            event.preventDefault()
          }
        } else if (key === 'Enter') {
          onSelect(nodeId)
        }
      },
      [onToggleOpen, onSelect, isOpen, nodeId, hasChildNodes],
    )

    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTree)
    return (
      <RovingFocusGroup.Item asChild {...rovingFocusGroupScope}>
        <Primitive.div
          ref={forwardedRef}
          role="treeitem"
          aria-selected={isSelected || undefined}
          aria-expanded={hasChildNodes ? isOpen : undefined}
          tabIndex={-1}
          data-orientation={orientation}
          onKeyDown={composeEventHandlers(props.onKeyDown, handleKeyDown)}
          onClick={composeEventHandlers(props.onClick, () => onSelect(nodeId))}
          {...domProps}
        />
      </RovingFocusGroup.Item>
    )
  },
)
TreeItem.displayName = 'TreeItem'

/* -------------------------------------------------------------------------------------------------
 * TreeGroup
 * ----------------------------------------------------------------------------------------------- */

type TreeGroupElement = React.ElementRef<typeof Primitive.div>
type TreeGroupProps = React.ComponentPropsWithoutRef<typeof Primitive.div> & {
  parentId: string
}

const TreeGroup = React.forwardRef<TreeGroupElement, ScopedProps<TreeGroupProps>>(
  (props, forwardedRef) => {
    const { parentId, __scopeTree, ...domProps } = props
    const { openKeys } = useTreeContext(TREE_NAME, __scopeTree)
    const isOpen = openKeys.has(parentId)

    return (
      <Primitive.div
        ref={forwardedRef}
        role="group"
        aria-hidden={isOpen ? undefined : true}
        {...domProps}
      />
    )
  },
)
TreeGroup.displayName = 'TreeGroup'

/* -------------------------------------------------------------------------------------------------
 * TreeFactory
 * ----------------------------------------------------------------------------------------------- */

export type RecursiveNode = {
  id: string
  nodes?: RecursiveNode[]
}

export type FlatNode<T extends RecursiveNode = RecursiveNode> = Omit<T, 'nodes'> & {
  depth: number
  hasChildNodes: boolean
  childNodesCount: number
  parentId: string | null
  ancestors: (string | null)[]
}

type TreeFactoryBaseProps<T extends RecursiveNode> = {
  /** */
} & TreeProps

type TreeFactoryProps<T extends RecursiveNode> =
  | (TreeFactoryBaseProps<T> & {
      items: T[]
      Item: (props: T) => React.ReactNode
      Group: (props: T & { children: React.ReactNode }) => React.ReactNode
      virtualized?: false
      VItem?: never
      flatItems?: never
    })
  | (TreeFactoryBaseProps<T> & {
      virtualized: true
      flatItems: FlatNode<T>[] // pre-flattened items
      VItem: (props: FlatNode<T>) => React.ReactNode
      items?: never
      Item?: never
      Group?: never
    })

function TreeFactory<T extends RecursiveNode>({
  items,
  flatItems,
  Item,
  Group,
  virtualized,
  VItem,
  ...treeProps
}: TreeFactoryProps<T>) {
  //
  // Recursive render of a node
  //

  function renderNode(item: T) {
    const { id, nodes } = item
    const hasChildNodes = Boolean(nodes?.length)

    return (
      <React.Fragment key={id}>
        <TreeItem nodeId={id} hasChildNodes={hasChildNodes} asChild>
          {Item!(item)}
        </TreeItem>

        {/* If there are children, wrap them in a <TreeGroup> */}
        {hasChildNodes && (
          <TreeGroup parentId={id} asChild>
            {Group!({
              ...item,
              children: nodes?.map((child) => renderNode(child as T)),
            })}
          </TreeGroup>
        )}
      </React.Fragment>
    )
  }

  return (
    <Tree {...treeProps}>
      {virtualized ? (
        <VItems flatItems={flatItems}>{VItem}</VItems>
      ) : (
        items.map((item) => renderNode(item))
      )}
    </Tree>
  )
}

// VItems

//
//
//

// function getAllSelectedKeysWithChildren(tree: RecursiveNode[], selectedKeys: Set<string>) {
//     const ret = new Set<string>();

//     // Depth-first collection of child keys, including the node's own key
//     function collectAllKeys(node: RecursiveNode) {
//         ret.add(node.id);
//         if (node.nodes) {
//             for (const child of node.nodes) {
//                 collectAllKeys(child);
//             }
//         }
//     }

//     // Traverse the entire tree to find matching nodes whose key is selected
//     function traverse(nodes: RecursiveNode[]) {
//         for (const node of nodes) {
//             // If node's key is in `selectedKeys`, collect it & its descendants
//             if (selectedKeys.has(node.id)) {
//                 collectAllKeys(node);
//             }
//             // Keep traversing even if node's key isn't selected, because its children might be
//             if (node.nodes?.length) {
//                 traverse(node.nodes);
//             }
//         }
//     }

//     traverse(tree);
//     return ret;
// }

/**
 * Flatten `nodes` into a 1-level array, with additional `depth` and `hasChildNodes` metadata
 * Exclude the node if not expanded
 *
 * eg. from:
 * ```ts
 * [
 *   { id: '1', nodes: [{ id: '2' }] },
 *   { id: '3' },
 *   { id: '4', nodes: [{ id: '5' }] },
 * ]
 * ```
 *
 * to:
 *
 * ```ts
 * [
 *   { id: '1', depth: 0, hasChildNodes: true, childNodesCount: 1 },
 *   { id: '2', depth: 1, hasChildNodes: false, childNodesCount: 0 },
 *   { id: '3', depth: 0, hasChildNodes: false, childNodesCount: 0 },
 *   { id: '4', depth: 0, hasChildNodes: true, childNodesCount: 1 },
 *   { id: '5', depth: 1, hasChildNodes: false, childNodesCount: 0 },
 * ]
 */

export function flatten<T extends RecursiveNode>(
  nodes: T[],
  expandedNodes?: Set<string>,
  depth = 0,
  parentId: string | null = null,
  ancestors: (string | null)[] = depth === 0 ? [null] : [],
) {
  const result: FlatNode<T>[] = []

  for (const node of nodes) {
    const childNodesCount = node.nodes?.length ?? 0
    const hasChildNodes = childNodesCount > 0
    const currentAncestors = [...ancestors]
    const flatNode = {
      ...node,
      depth,
      hasChildNodes,
      childNodesCount,
      parentId,
      ancestors: currentAncestors,
    }
    result.push(flatNode)

    // If the item has children and is expanded, process them recursively
    if (hasChildNodes && (expandedNodes?.has(node.id) ?? true)) {
      const childAncestors = [...currentAncestors, node.id]
      result.push(...flatten(node.nodes as T[], expandedNodes, depth + 1, node.id, childAncestors))
    }
  }

  return result
}

function VItems<T extends RecursiveNode>(
  props: ScopedProps<{
    flatItems: FlatNode<T>[]
    children: (props: FlatNode<T>) => React.ReactNode
  }>,
) {
  const { flatItems, children: render, __scopeTree } = props
  const { openKeys, selectedKeys } = useTreeContext(TREE_NAME, __scopeTree)

  // const allSelectedKeys = getAllSelectedKeysWithChildren(items, selectedKeys);
  const allSelectedKeys = selectedKeys

  return (
    <>
      {flatItems.map((flatItem) => (
        <TreeItem
          key={flatItem.id}
          nodeId={flatItem.id}
          hasChildNodes={flatItem.hasChildNodes}
          aria-selected={allSelectedKeys.has(flatItem.id) || undefined}
          aria-expanded={openKeys.has(flatItem.id) || undefined}
          aria-level={flatItem.depth}
          // {...flatItem} // depth
          asChild
        >
          {render(flatItem)}
        </TreeItem>
      ))}
    </>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * ----------------------------------------------------------------------------------------------- */

export const createTreePrimitiveScope = createTreeScope()

const Root = Tree
const Group = TreeGroup
const Item = TreeItem

const Factory = TreeFactory

export {
  createTreeScope,
  //
  Tree,
  TreeGroup,
  TreeItem,
  TreeFactory,
  //
  Root,
  Group,
  Item,
  Factory,
}

export type { TreeProps, TreeItemProps }
