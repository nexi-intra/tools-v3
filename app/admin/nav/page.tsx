import { Button } from '@/components/ui/button'
import prisma from '@/prisma'
import Link from 'next/link'
import React from 'react'


export default async function Page() {

  const nodes = await prisma.appNode.findMany()
  return (
    <div>
      {nodes.map(node => <div key={node.id}>


        <Link href={`./nav/` + node.name} > <Button>{node.name}</Button> </ Link>

      </div>)}

    </div>
  )
}
