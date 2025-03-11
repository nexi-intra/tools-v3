// app/api/hash/route.ts
import prisma from '@/prisma';
import { NextResponse, NextRequest } from 'next/server';


/**
 * GET endpoint that accepts a `dataUrl` query parameter, calculates its hash,
 * and returns the hash in a JSON response.
 */
export async function GET(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams
  const width = searchParams.get("width")

  const slug = pathName.split('/').filter(Boolean);

  const [blob, blob_id] = slug;
  const id = parseInt(blob_id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Parameter is not a number.' }, { status: 500 });
  }


  try {
    if (!blob_id) {
      return NextResponse.json(
        { error: 'Missing dataUrl query parameter.' },
        { status: 400 }
      );
    }
    const blob = await prisma.blob.findUnique({
      where: {
        id,
        // BlobResized: {
        //   some: {
        //     width: width ? parseInt(width) : 0
        //   }
        // }
      },
      select: {
        data: true,
        content_type: true,
        source_tool: true,
        source_tool_id: true,
        BlobResized: {
          where: {
            width: width ? parseInt(width) : 0
          },
        }
      }
    }
    );
    if (!blob) {
      return NextResponse.json(
        { error: 'Blob not found.' },
        { status: 404 }
      );
    }

    // Remove common problematic invisible characters (like zero width spaces)
    const cleanName = blob.source_tool?.name
      .replaceAll(" ", "_")
      .replace(/\u200B/g, "") // remove zero width space(s)
      .toLowerCase();

    const widthTag = blob.BlobResized.length === 1 ? "-w" + width : "";
    const filename = (cleanName || 'picture') + widthTag + ".png";

    // Prepare the response with the binary image data.
    // Since Prisma returns a Buffer for the Bytes field, we can use it directly.



    const response = new NextResponse(blob.BlobResized.length === 1 ? blob.BlobResized[0].data : blob.data);
    response.headers.set('Content-Type', blob.content_type);

    // Set the Cache-Control header to cache for one year (31536000 seconds) and mark as immutable.
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Content-Disposition', `inline; filename="${filename}"`);

    return response;


  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error reading blob.' },
      { status: 500 }
    );
  }
}
