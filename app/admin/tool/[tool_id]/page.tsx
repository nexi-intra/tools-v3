import { sessionGetLanguage } from '@/actions/session-actions'
import ToolPage from '@/components/tool-page'
import ToolsPage2 from '@/components/tools-page2'
import { SupportedLanguage } from '@/contexts/language-context'
import prisma from '@/prisma'
import { Metadata } from 'next'
import React, { Suspense } from 'react'
import { z } from 'zod'


type PageProps = {

  params: Promise<{ tool_id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}




export default async function Page({
  params,
  searchParams,
}: PageProps) {
  const _params = await params
  const language = await sessionGetLanguage()

  const tool_id = _params.tool_id

  const id = parseInt(tool_id)
  const tool = await prisma.tool.findFirst({
    where: {
      id
    },
    include: {
      category: true,
      ToolTexts: true

    }
  });

  if (!tool) {
    return <div className="text-red-500 p-20">Not found</div>
  }
  return (
    <Suspense fallback={<div>...</div>}>

      <ToolPage language={language} id={id} />
      <div className="w-full overflow-auto max-w-full overflow-scroll">
        <textarea className='w-full h-96' readOnly>
          {JSON.stringify(tool, null, 2)}

        </textarea>
      </div>
    </Suspense>
  )
}
