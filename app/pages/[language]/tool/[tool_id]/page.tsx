import ToolPage from '@/components/tool-page'
import ToolsPage2 from '@/components/tools-page2'
import { SupportedLanguage } from '@/contexts/language-context'
import prisma from '@/prisma'
import { Metadata } from 'next'
import React, { Suspense } from 'react'
import { z } from 'zod'


type PageProps = {

  params: Promise<{ language: string, tool_id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const translationSchema = z.object({
  loading: z.string(),

});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    loading: "Loading...",
  },
  da: {
    loading: "Indlæser...",
  },
  it: {
    loading: "Caricamento...",
  }
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps) {
  const _params = await params
  const _searchParams = await searchParams
  const language = _params.language
  const tool_id = _params.tool_id

  const tool = await prisma.tool.findFirst({
    where: {
      id: parseInt(tool_id),
      ToolTexts: {

        some: {
          language: {
            code: language,
          },

        },
      },
    },
    include: {
      ToolTexts: true,
      category: true,
    }
  });
  const metadata: Metadata = {
    title: tool?.ToolTexts[0].name,
    openGraph: {
      title: tool?.ToolTexts[0].name,
      description: tool?.ToolTexts[0].description!,
      images: [
        {
          url: "/og/tool/" + tool_id,
          width: 1200,
          height: 600,

          alt: tool?.ToolTexts[0].name,
        },
      ],
    },

    description: tool?.ToolTexts[0].description!,
  };
  return metadata
}



export default async function Page({
  params,
  searchParams,
}: PageProps) {
  const _params = await params
  const _searchParams = await searchParams
  const language = _params.language as SupportedLanguage
  const tool_id = _params.tool_id
  const t = translations[language];
  const id = parseInt(tool_id)
  return (
    <Suspense fallback={<div>{t.loading}</div>}>

      <ToolPage language={language as SupportedLanguage} id={id} />
    </Suspense>
  )
}
