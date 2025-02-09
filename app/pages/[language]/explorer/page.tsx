import ToolsPage2 from '@/components/tools-page2'
import { SupportedLanguage } from '@/contexts/language-context'
import React, { Suspense } from 'react'


type Params = Promise<{ language: string }>


export async function generateMetadata(props: {
  params: Params

}) {
  const params = await props.params
  const language = params.language

}

export default async function Page(props: {
  params: Params

}) {
  const params = await props.params
  const language = params.language
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolsPage2 query={''} language={language as SupportedLanguage} />
    </Suspense>
  )
}
