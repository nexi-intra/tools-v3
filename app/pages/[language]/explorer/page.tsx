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
  const query = _searchParams.q as string
  const excludeGroupTools = _searchParams.grouptools === 'false'
  const countries = Array.isArray(_searchParams.countries) ? _searchParams.countries : (!_searchParams.countries ? [] : _searchParams.countries.split(","))


  return (
    <Suspense fallback={<div>Loading...</div>}>

      <ToolsPage2
        excludeGroupTools={excludeGroupTools}
        query={query} countries={countries} language={language as SupportedLanguage} token={token} />
    </Suspense>
  )
}
