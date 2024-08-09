import * as React from 'react'

import { DocsContext } from './DocsContext'
import { getData } from '@/utils/docs'
import { MenuContext, useMenu } from './MenuContext'
import { Foo } from './Foo'

export type Props = {
  params: { slug: string[] }
  children: React.ReactNode
}

export default async function Layout({ params, children }: Props) {
  const slug = params.slug
  const { docs, doc } = await getData(...slug)

  return (
    <>
      <DocsContext value={{ docs, doc }}>
        <MenuContext>
          <Foo>{children}</Foo>
        </MenuContext>
      </DocsContext>
    </>
  )
}
