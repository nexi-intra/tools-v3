


//import { UserProfile } from 'prisma/';
import prisma from '@/prisma';
import { endsWith, filter } from 'lodash-es';

import React from 'react'
import { TableOfBoards } from './client';
import { getKoksmatTokenCookie } from '@/lib/auth';

import { Board, GuestDomain } from '@prisma/client';
import { ToolsApp } from '@/internal/app-tools';

type PageProps = {


  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}




export default async function Page({

  searchParams,
}: PageProps) {

  const app = new ToolsApp()
  const user = await app.user()
  if (!user) {
    return <div>Not logged in</div>
  }

  const isSuperAdmin = await app.isSuperAdmin(user)

  let boards: { title: string, description: string }[] = []
  {
    const filteredDomains = await prisma.board.findMany({
      where: {
        created_by: user.name
      }
    })


    boards = filteredDomains.map((board: Board) => {

      return {
        id: board.id,
        title: board.name,
        description: ""
      }
    })
  }




  return (
    <div>

      <TableOfBoards boards={boards} />


    </div>
  )
}
