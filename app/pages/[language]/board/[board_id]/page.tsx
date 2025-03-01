import TileOrganizer from '@/components/tile-organizer'
import { SupportedLanguage } from '@/contexts/language-context'
import prisma from '@/prisma'
import { Metadata } from 'next'
import React, { Suspense } from 'react'
import { z } from 'zod'


type PageProps = {

  params: Promise<{ language: string, board_id: string }>
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
  const board_id = _params.board_id

  const board = await prisma.board.findFirst({
    where: {
      id: parseInt(board_id),

    },

  });
  const metadata: Metadata = {
    title: board?.name,
    openGraph: {
      title: board?.name,
      description: board?.description!,
      images: [
        {
          url: "/og/board/" + board_id,
          width: 1200,
          height: 600,

          alt: board?.name,
        },
      ],
    },

    description: board?.description!,
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
  const board_id = _params.board_id
  const t = translations[language];
  const id = parseInt(board_id)
  return (
    <Suspense fallback={<div>{t.loading}</div>}>

      <TileOrganizer />
    </Suspense>
  )
}
