import React from 'react'
import prisma from '@/prisma';
import { convertBufferToDataUrl } from '@/lib/blob';
type PageProps = {

  params: Promise<{}>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({

  searchParams,
}: PageProps) {
  const _searchParams = await searchParams
  const width = _searchParams.width
  if (!width) {
    return <div>Missing
      width</div>
  }

  const images = await prisma.blobResized.findMany({
    where: {
      width: parseInt(width as string),

    },
    include: {
      blob: true,
    },
  });

  return (
    <div>Images

      {images.map(image => (
        <div key={image.id} className='flex'>
          <div className='text-2xl'>{image.blob.id}</div>
          <img className="border m-3" src={convertBufferToDataUrl(Buffer.from(image.data))} alt={image.blob.name} />
          <img className="border m-3" src={"/blob/" + image.blob.id + "?width=" + width} /> {image.blob.name}
        </div>


      ))
      }</div>
  )
}
