import ToolPage from '@/components/tool-page'
import ToolsPage2 from '@/components/tools-page2'
import { SupportedLanguage } from '@/contexts/language-context'
import prisma from '@/prisma'
import { t } from '@/trpc/routers/post'

import { Metadata } from 'next'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { z } from 'zod'


type PageProps = {


  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}




export default async function Page({

  searchParams,
}: PageProps) {

  const _searchParams = await searchParams




  const tools = await prisma.tool.findMany({
    orderBy: {
      name: 'asc'
    },


  });


  return (
    <Suspense fallback={<div>...</div>}>
      {tools.map(tool => (
        <div key={tool.id}>
          <Link href={`/admin/tool/${tool.id}`} >
            {tool.name}
          </Link>
        </div>
      ))}
    </Suspense>
  )
}
