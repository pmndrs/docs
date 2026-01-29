'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as Tree from '@/components/primitives/Tree'
import type { RecursiveNode } from '@/components/primitives/Tree'
import Link from 'next/link'
import * as React from 'react'
import { IoIosArrowDown } from 'react-icons/io'

const INDEX_PAGE = 'introduction'

type NavNode = RecursiveNode & {
  title: string
  url?: string
  nav: number
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
  const tree = React.useMemo(() => buildTree(docs), [docs])

  // Find active keys (all nodes that contain the active path)
  const activeKeys = React.useMemo(() => {
    const keys: string[] = []
    const currentPath = `/${asPath}`

    function findActiveKeys(nodes: NavNode[], ancestors: string[] = []) {
      for (const node of nodes) {
        const nodeAncestors = [...ancestors, node.id]
        if (node.url === currentPath) {
          keys.push(...nodeAncestors)
        }
        if (node.nodes) {
          findActiveKeys(node.nodes as NavNode[], nodeAncestors)
        }
      }
    }

    findActiveKeys(tree)
    return keys
  }, [tree, asPath])

  return (
    <Tree.Factory
      className={cn(className)}
      items={tree}
      defaultOpenKeys={activeKeys}
      loop={false}
      Item={({ id, title, url, nodes }) => {
        const isActive = url === `/${asPath}`
        const hasChildren = Boolean(nodes?.length)

        return (
          <div className="relative">
            {url ? (
              <Link
                href={url}
                className={cn(
                  'block cursor-pointer rounded-r-xl p-(--NavItem-pad) pl-(--rgrid-m)',
                  hasChildren && 'pr-[calc(2*var(--NavItem-pad)+var(--arrow-size))]',
                  'text-sm [--NavItem-pad:.75rem] [--arrow-size:--spacing(4)]',
                  'capitalize tracking-wide',
                  isActive ? 'bg-primary-container' : 'bg-surface',
                )}
              >
                {title}
              </Link>
            ) : (
              <div
                className={cn(
                  'block rounded-r-xl p-(--NavItem-pad) pl-(--rgrid-m)',
                  hasChildren && 'pr-[calc(2*var(--NavItem-pad)+var(--arrow-size))]',
                  'text-sm [--NavItem-pad:.75rem] [--arrow-size:--spacing(4)]',
                  'capitalize tracking-wide',
                  isActive ? 'bg-primary-container' : 'bg-surface',
                )}
              >
                {title}
              </div>
            )}
            {collapsible && hasChildren && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // The tree handles the toggle via keyboard/click on the item
                  const treeItem = e.currentTarget.closest('[role="treeitem"]')
                  if (treeItem) {
                    const keyEvent = new KeyboardEvent('keydown', {
                      key: 'ArrowRight',
                      bubbles: true,
                    })
                    treeItem.dispatchEvent(keyEvent)
                  }
                }}
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 p-(--NavItem-pad) transition-transform',
                  'aria-expanded:rotate-90',
                )}
                aria-label="Toggle"
              >
                <IoIosArrowDown className="size-(--arrow-size) -rotate-90" />
              </button>
            )}
          </div>
        )
      }}
      Group={({ children }) => <div className="aria-hidden:hidden [&>*]:text-xs">{children}</div>}
    />
  )
}

// Build a recursive tree structure from flat docs array
function buildTree(docs: Doc[]): NavNode[] {
  const tree: NavNode[] = []

  // Build tree recursively
  const buildNode = (slugPath: string[], level: number = 0): NavNode[] => {
    const nodes: NavNode[] = []
    const childrenByPrefix = new Map<string, Doc[]>()

    // Find all docs at this level
    docs.forEach((doc) => {
      if (doc.slug.length > level) {
        const matchesPrefix = slugPath.every((segment, i) => doc.slug[i] === segment)
        if (matchesPrefix && doc.slug.length > level) {
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
        const navA = docsA.find((d) => d.slug[d.slug.length - 1] === a)?.nav || 0
        const navB = docsB.find((d) => d.slug[d.slug.length - 1] === b)?.nav || 0
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
