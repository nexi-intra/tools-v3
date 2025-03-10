import React from 'react'
import prisma from '@/prisma';
import { convertBufferToDataUrl } from '@/lib/blob';

export default async function Page() {
  const images = await prisma.blobResized.findMany({
    where: {
      width: 64,

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
          <img className="border m-3" src={"/blob/" + image.blob.id + "?width=64"} /> {image.blob.name}
        </div>


      ))
      }</div>
  )
}
