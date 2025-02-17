import ToolsPage2 from '@/components/tools-page2'
import { SupportedLanguage } from '@/contexts/language-context'
import React, { Suspense } from 'react'

import PageProps from 'next';



export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ language: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const _params = await params
  const _searchParams = await searchParams
  const language = _params.language



}



export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ language: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const _params = await params
  const _searchParams = await searchParams
  const language = _params.language
  const token = _searchParams.token as string

  return (
    <Suspense fallback={<div>Loading...</div>}>

      <ToolsPage2 query={_searchParams.q as string} language={language as SupportedLanguage} token={token} />
    </Suspense>
  )
}
