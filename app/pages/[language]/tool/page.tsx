


//import { UserProfile } from 'prisma/';
import prisma from '@/prisma';
import { endsWith, filter } from 'lodash-es';

import React from 'react'
import { TableOfTools } from './client';
import { getKoksmatTokenCookie } from '@/lib/auth';

import { Tool } from '@prisma/client';
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

  let tools: { title: string, description: string }[] = []
  {
    const filteredTools = await prisma.tool.findMany({
      // skip: 0,
      // take: 10,
      where: {
        created_by: user.name,
        koksmat_masterdata_id: {
          equals: null
        }


      },
      select: {
        id: true,
        name: true,
        icon: true
      },

      orderBy: {
        name: 'asc'
      }
    })


    tools = filteredTools.map((tool) => {

      return {
        id: tool.id,
        title: tool.name,
        description: "",
        refObject1: tool//{ ...tool, icon: tool.icon?.indexOf("data") === 0 ? tool.icon : "/placeholder.png" }
      }
    })
  }




  return (
    <div>

      <TableOfTools tools={tools} />


    </div>
  )
}
