import { actionUserHomePageGet } from '@/actions/user-actions';
import RedirectConfig from '@/redirect-config';
import React from 'react'

export default async function Page() {

  const { homePage, language } = await actionUserHomePageGet()
  return (
    <RedirectConfig defaultLanguage={language!} homePageUrl={homePage!} />

  )
}
