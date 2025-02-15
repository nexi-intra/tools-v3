import SetLanguage from '@/components/set-language'
import React from 'react'

export default async function SetLanguageClientSide({
  children,
  params

}: {
  children: React.ReactNode
  params: Promise<{ language: string }>

}) {
  const language = (await params).language
  return (
    <>
      <SetLanguage language={language} />
      {children}
    </>
  )
}
