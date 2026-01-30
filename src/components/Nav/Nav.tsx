'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as Tree from '@abernier/radix-tree'
import { flatten, type FlatNode } from '@abernier/radix-tree'
import Link from 'next/link'
import * as React from 'react'
import { IoIosArrowDown } from 'react-icons/io'

const INDEX_PAGE = 'introduction'

type NavNode = {
  id: string
  title: string
  url?: string
  nav: number
  nodes?: NavNode[]
}

export function Nav({
  className,
  docs,
  asPath,
  collapsible = true,
}: React.ComponentProps<'ul'> & {
  docs: Doc[]
  asPath: string
  collapsible: boolean
}) {
  // Convert flat docs to nested structure (simpler than before)
  const items = React.useMemo(() => docsToNavNodes(docs), [docs])

  // Find active keys and their ancestors
  const defaultOpenKeys = React.useMemo(() => {
    const keys: string[] = []
    const currentPath = `/${asPath}`

    function findActiveKeys(nodes: NavNode[], ancestors: string[] = []) {
      for (const node of nodes) {
        const nodeAncestors = [...ancestors, node.id]
        if (node.url === currentPath) {
          keys.push(...nodeAncestors)
        }
        if (node.nodes) {
          findActiveKeys(node.nodes, nodeAncestors)
        }
      }
    }

    findActiveKeys(items)
    return keys
  }, [items, asPath])

  const [openKeys, setOpenKeys] = React.useState<string[]>(defaultOpenKeys)

  // Flatten items based on which keys are open
  const flatItems = React.useMemo(() => flatten(items, new Set(openKeys)), [items, openKeys])

  return (
    <Tree.Factory
      className={cn(className)}
      virtualized
      flatItems={flatItems}
      openKeys={openKeys}
      onOpenKeysChange={setOpenKeys}
      loop={false}
      VItem={({ id, title, url, depth, hasChildNodes }) => {
        const isActive = url === `/${asPath}`

        return (
          <div className="relative" style={{ marginLeft: `${depth * 16}px` }}>
            {url ? (
              <Link
                href={url}
                className={cn(
                  'block cursor-pointer rounded-r-xl p-(--NavItem-pad) pl-(--rgrid-m)',
                  hasChildNodes && 'pr-[calc(2*var(--NavItem-pad)+var(--arrow-size))]',
                  'text-sm [--NavItem-pad:.75rem] [--arrow-size:--spacing(4)]',
                  depth === 0 && 'capitalize tracking-wide',
                  depth > 0 && 'text-xs',
                  isActive ? 'bg-primary-container' : 'bg-surface',
                )}
              >
                {title}
              </Link>
            ) : (
              <div
                className={cn(
                  'block rounded-r-xl p-(--NavItem-pad) pl-(--rgrid-m)',
                  hasChildNodes && 'pr-[calc(2*var(--NavItem-pad)+var(--arrow-size))]',
                  'text-sm [--NavItem-pad:.75rem] [--arrow-size:--spacing(4)]',
                  depth === 0 && 'capitalize tracking-wide',
                  depth > 0 && 'text-xs',
                  isActive ? 'bg-primary-container' : 'bg-surface',
                )}
              >
                {title}
              </div>
            )}
            {collapsible && hasChildNodes && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Get the tree item element to check its expansion state
                  const treeItem = e.currentTarget.closest('[role="treeitem"]')
                  if (treeItem) {
                    const isExpanded = treeItem.getAttribute('aria-expanded') === 'true'
                    // Dispatch the appropriate key event to toggle
                    const keyEvent = new KeyboardEvent('keydown', {
                      key: isExpanded ? 'ArrowLeft' : 'ArrowRight',
                      bubbles: true,
                    })
                    treeItem.dispatchEvent(keyEvent)
                  }
                }}
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 p-(--NavItem-pad) transition-transform',
                  'aria-expanded:rotate-90',
                )}
                aria-label={`Toggle ${title} submenu`}
              >
                <IoIosArrowDown className="size-(--arrow-size) -rotate-90" />
              </button>
            )}
          </div>
        )
      }}
    />
  )
}

// Convert flat docs array to nested NavNode structure
function docsToNavNodes(docs: Doc[]): NavNode[] {
  const buildNode = (slugPath: string[], level: number = 0): NavNode[] => {
    const nodes: NavNode[] = []
    const childrenByPrefix = new Map<string, Doc[]>()

    // Find all docs at this level
    docs.forEach((doc) => {
      if (doc.slug.length > level) {
        const matchesPrefix = slugPath.every((segment, i) => doc.slug[i] === segment)
        if (matchesPrefix) {
          const nextSegment = doc.slug[level]
          const children = childrenByPrefix.get(nextSegment) || []
          children.push(doc)
          childrenByPrefix.set(nextSegment, children)
        }
      }
    })

    // Create nodes for each segment
    Array.from(childrenByPrefix.entries())
      .sort(([a], [b]) => {
        // Find docs for sorting by nav property
        const docsA = childrenByPrefix.get(a) || []
        const docsB = childrenByPrefix.get(b) || []
        // Match docs where the segment matches at the current level
        const navA = docsA.find((d) => d.slug.length === level + 1 && d.slug[level] === a)?.nav || 0
        const navB = docsB.find((d) => d.slug.length === level + 1 && d.slug[level] === b)?.nav || 0
        return navA - navB
      })
      .forEach(([segment, segmentDocs]) => {
        const newPath = [...slugPath, segment]

        // Find if there's an index/introduction page for this segment
        const indexDoc = segmentDocs.find((d) => {
          return d.slug.length === newPath.length && d.slug[d.slug.length - 1] === INDEX_PAGE
        })

        // Find exact match doc (leaf node at this level)
        const exactDoc = segmentDocs.find(
          (d) => d.slug.length === newPath.length && d.slug.join('/') === newPath.join('/'),
        )

        // Get children recursively
        const children = buildNode(newPath, level + 1)

        const node: NavNode = {
          id: newPath.join('/'),
          title: exactDoc?.title || segment.replace(/\-/g, ' '),
          url: exactDoc?.url || indexDoc?.url,
          nav: exactDoc?.nav || indexDoc?.nav || 0,
          nodes: children.length > 0 ? children : undefined,
        }

        nodes.push(node)
      })

    return nodes
  }

  return buildNode([], 0)
}
