import prisma from "@/prisma";
import Link from "next/link";
import { Suspense } from "react";

export default async function AllPage() {


  const tools = await prisma.tool.findMany({
    orderBy: {
      name: 'asc'
    },
  });


  return (
    <Suspense fallback={<div>...</div>}>
      {tools.map(tool => (
        <div key={tool.id}>
          <Link href={`/admin/tool/${tool.id}`} >
            {tool.name}
          </Link>
        </div>
      ))}
    </Suspense>
  )
}
