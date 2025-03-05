
import { SupportedLanguage } from '@/contexts/language-context'
import prisma from '@/prisma'
import { Metadata } from 'next'
import React, { Suspense } from 'react'
import { z } from 'zod'
import ClientPage from './client'
import { ToolsApp } from '@/internal/app-tools'


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
  const id = parseInt(board_id)

  const board = await prisma.board.findFirst({
    where: {
      id

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



export default async function BoardIdPage({
  params,
  searchParams,
}: PageProps) {
  const app = new ToolsApp()

  try {
    const _params = await params
    const _searchParams = await searchParams
    const language = _params.language as SupportedLanguage
    const board_id = _params.board_id
    const id = parseInt(board_id)
    const t = translations[language];
    const app = new ToolsApp()
    const user = await app.user()
    if (!user) {
      return <div>Not logged in</div>
    }

    const board = await prisma.board.findFirst({
      where: {
        id,

      },
      include: {
        managedBy: true
      }

    });
    if (!board) {
      return <div>Board not found</div>
    }
    if (board.created_by !== user.name) {
      return <div><div className='text-3xl'>You are not allowed to edit this board</div>
        <div>Created by: {board.created_by}</div>
        <div>Managed by: {board.managedBy.map((managedBy) => managedBy.name).join(", ")}</div>
      </div>
    }
    //TODO: Support multiple editors
    // if (!board.managedBy.some((managedBy) => managedBy.id === user.id)) {
    //   return <div>Not authorized</div>

    return (
      <Suspense fallback={<div>{t.loading}</div>}>

        <ClientPage id={id} initialBoard={JSON.stringify(board.layout)} />
      </Suspense>
    )
  } catch (error) {
    app.log.error("BoardIdPage", error)

    return <div className='w-full h-full items-center'> <div className='text-red-500 '>Error</div></div>
  }

}
