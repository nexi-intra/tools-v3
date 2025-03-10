import { ToolsApp } from '@/internal/app-tools';
import { calculateDataUrlHash, convertDataUrlToBuffer } from '@/lib/blob';
import prisma from '@/prisma';
import sharp from 'sharp';
async function resizeImage(buffer: Buffer, width: number): Promise<Buffer> {
	try {
		const resizedBuffer = await sharp(buffer)
			.resize(width) // sets the width to 128 pixels; height is auto-calculated
			.toBuffer();
		return resizedBuffer;
	} catch (error) {
		console.error('Error resizing image:', error);
		throw error;
	}
}
async function main() {
	const app = new ToolsApp();
	const widths = [16, 32, 64, 128, 256];
	for (const width of widths) {
		const blobsToResize = await prisma.blob.findMany({
			where: {
				BlobResized: {
					none: {
						width,
					},
				},
			},
			include: {
				BlobResized: true,
			},
		});
		console.log(blobsToResize.length, 'items to resize to', width);
		for (const item of blobsToResize) {
			if (item.base64) {
				const image = convertDataUrlToBuffer(item.base64);
				const resized = await resizeImage(image, width);
				console.log(item.name);
				await prisma.blobResized.create({
					data: {
						width,
						blobId: item.id,
						data: resized,
					},
				});
			}
		}

		console.log('done');
	}
}

main();
